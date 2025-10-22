import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { products, stores } from '@/drizzle/schema'
import { eq, and, like, or, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search')
    const categoria = searchParams.get('categoria')
    const loja = searchParams.get('loja')
    const storeId = searchParams.get('storeId')
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
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
        imagens: products.imagens,
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
    
    const result = await query
    
    // Converter para formato esperado
    const formatted = result.map(p => ({
      ...p,
      id: p.id.toString(),
      storeId: p.storeId.toString(),
      preco: parseFloat(p.preco as string),
      precoPromocional: p.precoPromocional ? parseFloat(p.precoPromocional as string) : undefined,
      rating: parseFloat(p.rating as string || '0'),
      peso: p.peso ? parseFloat(p.peso as string) : undefined,
      imagens: p.imagens as string[] || [],
      dimensoes: p.dimensoes as any,
    }))
    
    return NextResponse.json({
      data: formatted,
      total: formatted.length
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
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
      imagens: body.imagens,
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

