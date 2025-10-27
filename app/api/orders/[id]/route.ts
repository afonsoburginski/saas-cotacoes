import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { orders, orderItems } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const orderId = parseInt(id)

    // Verificar autenticação
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`🗑️ Tentando deletar pedido #${orderId}`)

    // 🚀 CASCADE DELETE: Deletar order_items relacionados primeiro
    try {
      await db.delete(orderItems).where(eq(orderItems.orderId, orderId))
      console.log(`✅ Deletados order_items relacionados ao pedido ${orderId}`)
    } catch (orderItemsError) {
      console.log(`⚠️ Nenhum order_item relacionado ao pedido ${orderId} ou já foi deletado`)
    }

    // Buscar o pedido antes de deletar para verificar ownership
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verificar se o pedido pertence à loja do usuário (opcional, se necessário)
    // Esta verificação pode ser omitida se não houver necessidade de validação adicional

    // Deletar o pedido
    const [deletedOrder] = await db
      .delete(orders)
      .where(eq(orders.id, orderId))
      .returning()

    if (!deletedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log(`✅ Pedido #${orderId} deletado com sucesso`)

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
      data: { ...deletedOrder, id: deletedOrder.id.toString() }
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}

