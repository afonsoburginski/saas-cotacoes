import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { services, stores } from '@/drizzle/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [service] = await db
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
      .where(eq(services.id, parseInt(params.id)))
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    const formatted = {
      ...service,
      id: service.id.toString(),
      storeId: service.storeId.toString(),
      preco: parseFloat(service.preco as string),
      precoMinimo: service.precoMinimo ? parseFloat(service.precoMinimo as string) : undefined,
      precoMaximo: service.precoMaximo ? parseFloat(service.precoMaximo as string) : undefined,
      rating: parseFloat(service.rating as string || '0'),
      imagens: service.imagens as string[] || [],
    }
    
    return NextResponse.json({ data: formatted })
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updateData: any = {
      updatedAt: sql`now()`,
    }
    
    if (body.nome !== undefined) updateData.nome = body.nome
    if (body.categoria !== undefined) updateData.categoria = body.categoria
    if (body.preco !== undefined) updateData.preco = body.preco.toString()
    if (body.precoMinimo !== undefined) updateData.precoMinimo = body.precoMinimo?.toString()
    if (body.precoMaximo !== undefined) updateData.precoMaximo = body.precoMaximo?.toString()
    if (body.tipoPrecificacao !== undefined) updateData.tipoPrecificacao = body.tipoPrecificacao
    if (body.ativo !== undefined) updateData.ativo = body.ativo
    if (body.destacado !== undefined) updateData.destacado = body.destacado
    if (body.descricao !== undefined) updateData.descricao = body.descricao
    if (body.imagemUrl !== undefined) updateData.imagemUrl = body.imagemUrl
    if (body.imagens !== undefined) updateData.imagens = body.imagens
    
    const [updated] = await db
      .update(services)
      .set(updateData)
      .where(eq(services.id, parseInt(params.id)))
      .returning()
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: { ...updated, id: updated.id.toString() },
      message: 'Service updated successfully'
    })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [deleted] = await db
      .delete(services)
      .where(eq(services.id, parseInt(params.id)))
      .returning()
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: { ...deleted, id: deleted.id.toString() },
      message: 'Service deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}

