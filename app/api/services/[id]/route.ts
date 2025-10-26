import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { services, orderItems } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, parseInt(id)))
      .limit(1)
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: {
        ...service,
        id: service.id.toString(),
      }
    })
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    
    const [updatedService] = await db
      .update(services)
      .set({
        nome: body.nome,
        categoria: body.categoria,
        preco: body.preco?.toString(),
        precoMinimo: body.precoMinimo?.toString(),
        precoMaximo: body.precoMaximo?.toString(),
        tipoPrecificacao: body.tipoPrecificacao,
        imagemUrl: body.imagemUrl,
        ativo: body.ativo,
        destacado: body.destacado,
        descricao: body.descricao,
      })
      .where(eq(services.id, parseInt(id)))
      .returning()
    
    return NextResponse.json({
      data: { ...updatedService, id: updatedService.id.toString() },
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const serviceId = parseInt(id)
    
    // 🚀 CASCADE DELETE: Deletar order_items relacionados primeiro
    try {
      await db
        .delete(orderItems)
        .where(eq(orderItems.serviceId, serviceId))
      console.log(`✅ Deletados order_items relacionados ao serviço ${serviceId}`)
    } catch (orderItemsError) {
      console.log(`⚠️ Nenhum order_item relacionado ao serviço ${serviceId} ou já foi deletado`)
    }
    
    // Agora pode deletar o serviço
    const [deletedService] = await db
      .delete(services)
      .where(eq(services.id, serviceId))
      .returning()
    
    if (!deletedService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: { ...deletedService, id: deletedService.id.toString() },
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
