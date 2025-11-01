import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { categories } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { apiCache } from '@/lib/api-cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get('tipo') as ('produto' | 'servico') | null
    
    // Cache key
    const cacheKey = `categories:${tipo || 'all'}`
    
    // Verificar cache primeiro
    const cached = apiCache.get(cacheKey, 60000) // 60s TTL (categorias mudam raramente)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Timeout de 2 segundos para query
    let rows
    try {
      rows = await Promise.race([
        db
          .select({ id: categories.id, nome: categories.nome, tipo: categories.tipo })
          .from(categories)
          .where(tipo ? and(eq(categories.ativo, true), eq(categories.tipo, tipo)) : eq(categories.ativo, true)),
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

    const names = rows.map(r => r.nome).sort()

    const response = {
      data: names,
      total: names.length,
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

