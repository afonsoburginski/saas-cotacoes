import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { products, stores } from '@/drizzle/schema'
import { eq, and, like, or, sql } from 'drizzle-orm'
import { apiCache } from '@/lib/api-cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search')
    const categoria = searchParams.get('categoria')
    const loja = searchParams.get('loja')
    const storeId = searchParams.get('storeId')
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const destacado = searchParams.get('destacado') === 'true'
    
    // Cache key baseado nos parâmetros
    const cacheKey = `products:${search || ''}:${categoria || ''}:${loja || ''}:${storeId || ''}:${includeInactive}:${destacado}`
    
    // Verificar cache primeiro (apenas para rotas públicas sem busca complexa)
    if (!search && !includeInactive) {
      const cached = apiCache.get(cacheKey, 30000) // 30s TTL
      if (cached) {
        return NextResponse.json(cached)
      }
    }
    
    let query = db
      .select({
        id: products.id,
        storeId: products.storeId,
        storeNome: stores.nome,
        nome: products.nome,
        categoria: products.categoria,
        preco: products.preco,
        precoPromocional: products.precoPromocional,
        estoque: products.estoque,
        unidadeMedida: products.unidadeMedida,
        rating: products.rating,
        imagemUrl: products.imagemUrl,
        ativo: products.ativo,
        destacado: products.destacado,
        sku: products.sku,
        descricao: products.descricao,
        temVariacaoPreco: products.temVariacaoPreco,
        peso: products.peso,
        dimensoes: products.dimensoes,
      })
      .from(products)
      .leftJoin(stores, eq(products.storeId, stores.id))
    
    const conditions = []
    
    if (!includeInactive) {
      conditions.push(eq(products.ativo, true))
    }
    
    if (destacado) {
      conditions.push(eq(products.destacado, true))
    }
    
    if (search) {
      conditions.push(
        or(
          like(products.nome, `%${search}%`),
          like(products.sku, `%${search}%`),
          like(products.categoria, `%${search}%`)
        )
      )
    }
    
    if (categoria) {
      conditions.push(eq(products.categoria, categoria))
    }
    
    if (storeId) {
      conditions.push(eq(products.storeId, parseInt(storeId)))
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }
    
    // Timeout de 2 segundos para query - rotas públicas precisam ser rápidas
    let result
    try {
      result = await Promise.race([
        query,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 2000)
        )
      ])
    } catch (queryError) {
      // Timeout ou erro na query - retornar vazio silenciosamente
      return NextResponse.json({
        data: [],
        total: 0,
      }, { status: 200 })
    }
    
    // Converter para formato esperado
    const formatted = result.map(p => ({
      ...p,
      id: p.id.toString(),
      storeId: p.storeId.toString(),
      preco: parseFloat(p.preco as string),
      precoPromocional: p.precoPromocional ? parseFloat(p.precoPromocional as string) : undefined,
      rating: parseFloat(p.rating as string || '0'),
      peso: p.peso ? parseFloat(p.peso as string) : undefined,
      dimensoes: p.dimensoes as any,
    }))
    
    const response = {
      data: formatted,
      total: formatted.length
    }
    
    // Cachear apenas para rotas públicas simples
    if (!search && !includeInactive) {
      apiCache.set(cacheKey, response)
    }
    
    return NextResponse.json(response)
  } catch (error: any) {
    // SEMPRE retornar 200 com dados válidos - rota pública não pode quebrar
    return NextResponse.json({
      data: [],
      total: 0,
    }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const [newProduct] = await db.insert(products).values({
      storeId: parseInt(body.storeId),
      nome: body.nome,
      categoria: body.categoria,
      preco: body.preco.toString(),
      precoPromocional: body.precoPromocional?.toString(),
      estoque: body.estoque,
      unidadeMedida: body.unidadeMedida,
      rating: '0',
      imagemUrl: body.imagemUrl,
      ativo: body.ativo,
      destacado: body.destacado,
      sku: body.sku,
      descricao: body.descricao,
      temVariacaoPreco: body.temVariacaoPreco,
      peso: body.peso?.toString(),
      dimensoes: body.dimensoes,
    }).returning()
    
    return NextResponse.json({
      data: { ...newProduct, id: newProduct.id.toString() },
      message: 'Product created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

