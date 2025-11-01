import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { stores, user as userTable } from '@/drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { apiCache } from '@/lib/api-cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Cache key
    const cacheKey = `service-providers:${limit}`
    
    // Verificar cache primeiro
    const cached = apiCache.get(cacheKey, 30000) // 30s TTL
    if (cached) {
      return NextResponse.json(cached)
    }
    
    // Buscar users com businessType='servico' e juntar com stores
    // Timeout de 2 segundos para query
    let serviceProviders
    try {
      serviceProviders = await Promise.race([
        db
          .select({
            id: stores.id,
            nome: stores.nome,
            rating: stores.rating,
            plano: stores.plano,
            status: stores.status,
            slug: stores.slug,
            userId: stores.userId,
            logo: stores.logo,
            coverImage: stores.coverImage,
          })
          .from(stores)
          .innerJoin(userTable, eq(stores.userId, userTable.id))
          .where(
            and(
              eq(userTable.businessType, 'servico'),
              eq(stores.status, 'approved')
            )
          )
          .limit(limit),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 2000)
        )
      ])
    } catch (queryError) {
      // Timeout ou erro - retornar vazio silenciosamente
      return NextResponse.json({
        data: [],
        total: 0,
      }, { status: 200 })
    }
    
    const response = {
      data: serviceProviders,
      total: serviceProviders.length
    }
    
    // Cachear resultado
    apiCache.set(cacheKey, response)
    
    return NextResponse.json(response)
  } catch (error: any) {
    // SEMPRE retornar 200 - rota pública não pode quebrar
    return NextResponse.json({
      data: [],
      total: 0,
    }, { status: 200 })
  }
}

