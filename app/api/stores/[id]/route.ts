import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { stores } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, parseInt(params.id)))
    
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }
    
    const formatted = {
      id: store.id.toString(),
      nome: store.nome,
      email: store.email,
      telefone: store.telefone,
      cnpj: store.cnpj,
      endereco: store.endereco,
      status: store.status,
      priorityScore: store.priorityScore,
      plano: store.plano,
      createdAt: store.createdAt?.toISOString().split('T')[0],
      shippingPolicy: store.shippingPolicy,
      address: store.address,
      rating: store.rating ? parseFloat(store.rating as string) : 0,
    }
    
    return NextResponse.json({ data: formatted })
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    )
  }
}

