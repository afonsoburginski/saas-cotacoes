import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { services, stores } from '@/drizzle/schema'
import { eq, and, like, or } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search')
    const categoria = searchParams.get('categoria')
    const storeId = searchParams.get('storeId')
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    let query = db
      .select({
        id: services.id,
        storeId: services.storeId,
        storeNome: stores.nome,
        nome: services.nome,
        categoria: services.categoria,
        preco: services.preco,
        precoMinimo: services.precoMinimo,
        precoMaximo: services.precoMaximo,
        tipoPrecificacao: services.tipoPrecificacao,
        rating: services.rating,
        imagemUrl: services.imagemUrl,
        imagens: services.imagens,
        ativo: services.ativo,
        destacado: services.destacado,
        descricao: services.descricao,
      })
      .from(services)
      .leftJoin(stores, eq(services.storeId, stores.id))
    
    const conditions = []
    
    if (!includeInactive) {
      conditions.push(eq(services.ativo, true))
    }
    
    if (search) {
      conditions.push(
        or(
          like(services.nome, `%${search}%`),
          like(services.categoria, `%${search}%`)
        )
      )
    }
    
    if (categoria) {
      conditions.push(eq(services.categoria, categoria))
    }
    
    if (storeId) {
      conditions.push(eq(services.storeId, parseInt(storeId)))
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }
    
    const result = await query
    
    const formatted = result.map(s => ({
      ...s,
      id: s.id.toString(),
      storeId: s.storeId.toString(),
      preco: parseFloat(s.preco as string),
      precoMinimo: s.precoMinimo ? parseFloat(s.precoMinimo as string) : undefined,
      precoMaximo: s.precoMaximo ? parseFloat(s.precoMaximo as string) : undefined,
      rating: parseFloat(s.rating as string || '0'),
      imagens: s.imagens as string[] || [],
    }))
    
    return NextResponse.json({
      data: formatted,
      total: formatted.length
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const [newService] = await db.insert(services).values({
      storeId: parseInt(body.storeId),
      nome: body.nome,
      categoria: body.categoria,
      preco: body.preco.toString(),
      precoMinimo: body.precoMinimo?.toString(),
      precoMaximo: body.precoMaximo?.toString(),
      tipoPrecificacao: body.tipoPrecificacao,
      rating: '0',
      imagemUrl: body.imagemUrl,
      imagens: body.imagens,
      ativo: body.ativo,
      destacado: body.destacado,
      descricao: body.descricao,
    }).returning()
    
    return NextResponse.json({
      data: { ...newService, id: newService.id.toString() },
      message: 'Service created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

