import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { stores, user as userTable } from '@/drizzle/schema'
import { eq, desc, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const businessType = searchParams.get('businessType') // 'comercio' | 'servico'
    
    console.log('🔍 /api/stores - Filtros:', { status, businessType })
    
    // Join com user para filtrar por businessType
    const query = db
      .select({
        id: stores.id,
        nome: stores.nome,
        email: stores.email,
        telefone: stores.telefone,
        cnpj: stores.cnpj,
        endereco: stores.endereco,
        status: stores.status,
        priorityScore: stores.priorityScore,
        plano: stores.plano,
        createdAt: stores.createdAt,
        shippingPolicy: stores.shippingPolicy,
        address: stores.address,
        totalProducts: stores.totalProducts,
        totalSales: stores.totalSales,
        rating: stores.rating,
        slug: stores.slug,
        userId: stores.userId,
      })
      .from(stores)
      .innerJoin(userTable, eq(stores.userId, userTable.id))
    
    const conditions = []
    
    if (status === 'ativo') {
      conditions.push(eq(stores.status, 'approved'))
    } else if (status) {
      conditions.push(eq(stores.status, status))
    }
    
    if (businessType) {
      conditions.push(eq(userTable.businessType, businessType))
    }
    
    const result = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(stores.priorityScore))
      : await query.orderBy(desc(stores.priorityScore))
    
    console.log('✅ Stores encontradas:', result.length)
    
    const formatted = result.map((s: any) => ({
      id: s.id.toString(),
      nome: s.nome,
      email: s.email,
      telefone: s.telefone,
      cnpj: s.cnpj,
      endereco: s.endereco,
      status: s.status,
      priorityScore: s.priorityScore,
      plano: s.plano,
      createdAt: s.createdAt?.toISOString().split('T')[0],
      shippingPolicy: s.shippingPolicy,
      address: s.address,
      totalProducts: s.totalProducts,
      totalSales: s.totalSales ? parseFloat(s.totalSales as string) : 0,
      rating: s.rating ? parseFloat(s.rating as string) : 0,
      slug: s.slug,
    }))
    
    return NextResponse.json({
      data: formatted,
      total: formatted.length
    })
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}
