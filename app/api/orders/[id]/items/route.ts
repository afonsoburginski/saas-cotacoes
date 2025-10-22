import { NextRequest, NextResponse } from "next/server"
import { db } from '@/drizzle'
import { orderItems, products, services } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📦 GET /api/orders/[id]/items - Buscando itens para orderId:', params.id)
    
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orderId = parseInt(params.id)
    console.log('🔍 Buscando itens para orderId:', orderId)

    // Buscar itens do pedido com dados completos dos produtos/serviços
    const orderItemsData = await db
      .select({
        // Dados do item do pedido
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        serviceId: orderItems.serviceId,
        qty: orderItems.qty,
        precoUnit: orderItems.precoUnit,
        precoTotal: orderItems.precoTotal,
        observacoes: orderItems.observacoes,
        createdAt: orderItems.createdAt,
        // Dados do produto (se for produto)
        productName: products.nome,
        productCategory: products.categoria,
        productImage: products.imagemUrl,
        productPrice: products.preco,
        productTemVariacaoPreco: products.temVariacaoPreco,
        productUnidadeMedida: products.unidadeMedida,
        // Dados do serviço (se for serviço)
        serviceName: services.nome,
        serviceCategory: services.categoria,
        serviceImage: services.imagemUrl,
        servicePrice: services.preco,
        serviceTipoPrecificacao: services.tipoPrecificacao,
        servicePrecoMinimo: services.precoMinimo,
        servicePrecoMaximo: services.precoMaximo,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(services, eq(orderItems.serviceId, services.id))
      .where(eq(orderItems.orderId, orderId))

    console.log('✅ Itens encontrados:', orderItemsData.length)
    console.log('📊 Dados dos itens:', orderItemsData.map(item => ({ 
      id: item.id, 
      productId: item.productId, 
      serviceId: item.serviceId,
      productName: item.productName,
      serviceName: item.serviceName,
      qty: item.qty 
    })))

    return NextResponse.json({
      success: true,
      data: orderItemsData
    })

  } catch (error) {
    console.error("Error fetching order items:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
