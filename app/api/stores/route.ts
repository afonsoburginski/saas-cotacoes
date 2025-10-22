import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { stores } from '@/drizzle/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = db.select().from(stores)
    
    if (status) {
      query = query.where(eq(stores.status, status)) as any
    }
    
    const result = await query.orderBy(desc(stores.priorityScore))
    
    const formatted = result.map(s => ({
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

