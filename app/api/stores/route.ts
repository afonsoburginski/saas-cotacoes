import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { stores, user as userTable } from '@/drizzle/schema'
import { eq, desc, and } from 'drizzle-orm'
import { apiCache } from '@/lib/api-cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const businessType = searchParams.get('businessType') // 'comercio' | 'servico'
    
    // Cache key
    const cacheKey = `stores:${status || ''}:${businessType || ''}`
    
    // Verificar cache primeiro
    const cached = apiCache.get(cacheKey, 30000) // 30s TTL
    if (cached) {
      return NextResponse.json(cached)
    }
    
    // Join com user para filtrar por businessType
    const query = db
      .select({
        id: stores.id,
        nome: stores.nome,
        email: stores.email,
        telefone: stores.telefone,
        cnpj: stores.cnpj,
        endereco: stores.endereco,
        status: stores.status,
        priorityScore: stores.priorityScore,
        plano: stores.plano,
        createdAt: stores.createdAt,
        shippingPolicy: stores.shippingPolicy,
        address: stores.address,
        totalProducts: stores.totalProducts,
        totalSales: stores.totalSales,
        rating: stores.rating,
        slug: stores.slug,
        userId: stores.userId,
      })
      .from(stores)
      .innerJoin(userTable, eq(stores.userId, userTable.id))
    
    const conditions = []
    
    if (status === 'ativo') {
      conditions.push(eq(stores.status, 'approved'))
    } else if (status) {
      conditions.push(eq(stores.status, status))
    }
    
    if (businessType) {
      conditions.push(eq(userTable.businessType, businessType))
    }
    
    // Timeout de 2 segundos para query
    let result
    try {
      const finalQuery = conditions.length > 0
        ? query.where(and(...conditions)).orderBy(desc(stores.priorityScore))
        : query.orderBy(desc(stores.priorityScore))
      
      result = await Promise.race([
        finalQuery,
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
    
    const formatted = result.map((s: any) => ({
      id: s.id.toString(),
      nome: s.nome,
      email: s.email,
      telefone: s.telefone,
      cnpj: s.cnpj,
      endereco: s.endereco,
      status: s.status,
      priorityScore: s.priorityScore,
      plano: s.plano,
      createdAt: s.createdAt?.toISOString().split('T')[0],
      shippingPolicy: s.shippingPolicy,
      address: s.address,
      totalProducts: s.totalProducts,
      totalSales: s.totalSales ? parseFloat(s.totalSales as string) : 0,
      rating: s.rating ? parseFloat(s.rating as string) : 0,
      slug: s.slug,
    }))
    
    const response = {
      data: formatted,
      total: formatted.length
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
