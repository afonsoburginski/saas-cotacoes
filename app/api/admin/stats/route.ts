import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { stores, user, orders } from '@/drizzle/schema'
import { count, sql, eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Total de usuários
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(user)

    // Total de lojas/stores
    const [totalStoresResult] = await db
      .select({ count: count() })
      .from(stores)

    // Total de pedidos/orders
    const [totalOrdersResult] = await db
      .select({ count: count() })
      .from(orders)

    // Receita total (soma dos valores dos pedidos)
    const [revenueResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${orders.total}), 0)` })
      .from(orders)

    // Lojas por status
    const storesByStatus = await db
      .select({
        status: stores.status,
        count: count(),
      })
      .from(stores)
      .groupBy(stores.status)

    // Lojas por plano
    const storesByPlan = await db
      .select({
        plano: stores.plano,
        count: count(),
      })
      .from(stores)
      .groupBy(stores.plano)

    // Lojas por tipo de negócio (comercio/servico)
    const storesByType = await db
      .select({
        tipo: sql<string>`COALESCE(${stores.descricao}, 'Não definido')`,
        count: count(),
      })
      .from(stores)
      .groupBy(sql`COALESCE(${stores.descricao}, 'Não definido')`)

    return NextResponse.json({
      totalUsers: totalUsersResult.count,
      totalStores: totalStoresResult.count,
      totalOrders: totalOrdersResult.count,
      totalRevenue: Number(revenueResult.total || 0),
      storesByStatus,
      storesByPlan,
      storesByType,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

