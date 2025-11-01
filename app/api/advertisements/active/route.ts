import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { storeAdvertisements, stores } from '@/drizzle/schema'
import { eq, and, or, isNull } from 'drizzle-orm'
import { apiCache } from '@/lib/api-cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function GET() {
  try {
    // Verificar cache primeiro
    const cacheKey = 'advertisements:active'
    const cached = apiCache.get(cacheKey, CACHE_TTL)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Query otimizada: buscar apenas campos necessários
    // Usa select direto do advertisement para evitar problemas com colunas inexistentes
    // Timeout de 2 segundos para query
    let activeAdvertisements
    try {
      activeAdvertisements = await Promise.race([
        db
          .select({
            advertisement: storeAdvertisements,
            store: stores,
          })
          .from(storeAdvertisements)
          .innerJoin(stores, eq(storeAdvertisements.storeId, stores.id))
          .where(
            and(
              // active !== false significa: active === true OU active === null
              or(
                eq(storeAdvertisements.active, true),
                isNull(storeAdvertisements.active)
              ),
              eq(stores.status, 'approved')
            )
          ),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 2000)
        )
      ])
    } catch (queryError) {
      // Timeout ou erro - retornar cache se disponível, senão vazio
      const cached = apiCache.get(cacheKey, CACHE_TTL * 2) // Aceitar cache mais antigo em caso de erro
      if (cached) {
        return NextResponse.json(cached)
      }
      return NextResponse.json({
        data: [],
        total: 0,
      }, { status: 200 })
    }

    // Processar e coletar todas as imagens
    const allImages: Array<{
      url: string
      storeId: number
      storeName: string
      advertisementId: number
      link: string | null
    }> = []

    for (const { advertisement, store } of activeAdvertisements) {
      const images = Array.isArray(advertisement.images) ? advertisement.images : []
      
      if (images.length > 0) {
        // Tentar pegar o link de forma segura (pode não existir ainda)
        const link = (advertisement as any).link || null
        
        for (const imageUrl of images) {
          if (imageUrl && typeof imageUrl === 'string') {
            allImages.push({
              url: imageUrl,
              storeId: store.id,
              storeName: store.nome || '',
              advertisementId: advertisement.id,
              link: link,
            })
          }
        }
      }
    }

    const response = {
      data: allImages,
      total: allImages.length,
    }
    
    // Atualizar cache
    apiCache.set(cacheKey, response)

    return NextResponse.json(response)
  } catch (error: any) {
    // Retornar cache antigo se disponível em caso de erro
    const cached = apiCache.get(cacheKey, CACHE_TTL * 2) // Aceitar cache mais antigo
    if (cached) {
      return NextResponse.json(cached, { status: 200 })
    }
    
    // SEMPRE retornar 200 com array vazio - rota pública não pode quebrar
    return NextResponse.json({
      data: [],
      total: 0,
    }, { status: 200 })
  }
}

