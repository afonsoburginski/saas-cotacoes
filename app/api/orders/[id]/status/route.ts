import { NextRequest, NextResponse } from "next/server"
import { db } from '@/drizzle'
import { orders } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orderId = parseInt(params.id)
    const { status } = await request.json()

    // Validar status
    const validStatuses = ['pendente', 'respondida', 'aceita', 'rejeitada', 'concluida']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    // Atualizar status do pedido
    const updatedOrder = await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning()

    if (updatedOrder.length === 0) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder[0]
    })

  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
