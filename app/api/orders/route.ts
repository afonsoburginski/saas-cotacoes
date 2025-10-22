import { NextRequest, NextResponse } from "next/server"
import { db } from '@/drizzle'
import { orders, orderItems, user, stores, products, services } from "@/drizzle/schema"
import { eq, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log('📋 GET /api/orders - Iniciando busca de pedidos')
    
    // Verificar autenticação
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('👤 Usuário autenticado:', session.user.email)

    // Buscar storeId do usuário
    const userRes = await fetch(`${request.nextUrl.origin}/api/user/store`, {
      headers: request.headers
    })

    if (!userRes.ok) {
      console.log('❌ Store não encontrada para o usuário')
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    const userData = await userRes.json()
    const storeId = userData.storeId

    if (!storeId) {
      console.log('❌ StoreId não encontrado')
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    console.log('🏪 Buscando pedidos para storeId:', storeId)

            // Buscar pedidos/cotações para esta loja com dados completos
            const ordersData = await db
              .select({
                // Dados do pedido
                id: orders.id,
                storeId: orders.storeId,
                userId: orders.userId,
                tipo: orders.tipo,
                status: orders.status,
                total: orders.total,
                observacoes: orders.observacoes,
                enderecoEntrega: orders.enderecoEntrega,
                dataEntrega: orders.dataEntrega,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
                // Dados do usuário
                userName: user.name,
                userEmail: user.email,
                userImage: user.image,
                userPhone: user.phone,
                // Dados da loja
                storeName: stores.nome,
                storeLogo: stores.logo,
              })
              .from(orders)
              .leftJoin(user, eq(orders.userId, user.id))
              .leftJoin(stores, eq(orders.storeId, stores.id))
              .where(eq(orders.storeId, storeId))
              .orderBy(desc(orders.createdAt))

            console.log('✅ Pedidos encontrados:', ordersData.length)
            console.log('📊 Dados dos pedidos:', ordersData.map(o => ({ id: o.id, status: o.status, total: o.total })))

            return NextResponse.json({
              success: true,
              data: ordersData
            })

  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação primeiro
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { storeId, customerName, customerEmail, items, total, notes } = body

    console.log('📝 Criando pedido:', { storeId, customerName, customerEmail, items, total })

    // Debug dos itens recebidos
    console.log('🔍 Items recebidos do carrinho:', items)
    items?.forEach((item: any, index: number) => {
      console.log(`📦 Item ${index}:`, {
        productId: item.productId,
        serviceId: item.serviceId,
        tipo: item.tipo,
        qty: item.qty,
        precoUnit: item.precoUnit,
        productNome: item.productNome
      })
    })

    // Criar novo pedido/cotação usando o userId da sessão
    const newOrder = await db
      .insert(orders)
      .values({
        storeId: parseInt(storeId),
        userId: session.user.id, // Usar o ID real do usuário da sessão
        tipo: 'cotacao',
        status: 'pendente',
        total,
        observacoes: notes,
      })
      .returning()

    console.log('✅ Pedido criado:', newOrder[0])

    // Criar itens do pedido
    if (items && items.length > 0) {
      const orderItemsData = []
      
      for (const item of items) {
        // Usar o campo 'tipo' do carrinho para determinar se é produto ou serviço
        const isService = item.tipo === 'service'
        
        if (isService && item.serviceId) {
          // Verificar se o serviço existe
          const serviceExists = await db
            .select({ id: services.id })
            .from(services)
            .where(eq(services.id, parseInt(item.serviceId)))
            .limit(1)
          
          if (serviceExists.length > 0) {
            orderItemsData.push({
              orderId: newOrder[0].id,
              productId: null,
              serviceId: parseInt(item.serviceId),
              qty: item.qty,
              precoUnit: item.precoUnit.toString(),
              precoTotal: (item.precoUnit * item.qty).toString(),
              observacoes: `${item.productNome || 'Serviço'} (Serviço ID: ${item.serviceId})`,
            })
          } else {
            console.warn(`⚠️ Serviço ID ${item.serviceId} não encontrado, pulando item`)
          }
        } else if (!isService && item.productId) {
          // Verificar se o produto existe
          const productExists = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.id, parseInt(item.productId)))
            .limit(1)
          
          if (productExists.length > 0) {
            orderItemsData.push({
              orderId: newOrder[0].id,
              productId: parseInt(item.productId),
              serviceId: null,
              qty: item.qty,
              precoUnit: item.precoUnit.toString(),
              precoTotal: (item.precoUnit * item.qty).toString(),
              observacoes: `${item.productNome || 'Produto'} (Produto ID: ${item.productId})`,
            })
          } else {
            console.warn(`⚠️ Produto ID ${item.productId} não encontrado, pulando item`)
          }
        } else {
          console.warn(`⚠️ Item sem ID válido:`, item)
        }
      }

      if (orderItemsData.length > 0) {
        console.log('📦 Criando itens do pedido:', orderItemsData)
        const createdItems = await db.insert(orderItems).values(orderItemsData).returning()
        console.log('✅ Itens criados com sucesso:', createdItems.length)
      } else {
        console.warn('⚠️ Nenhum item válido encontrado para criar')
      }
    }

    return NextResponse.json({
      success: true,
      data: newOrder[0]
    })

  } catch (error) {
    console.error("❌ Error creating order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
