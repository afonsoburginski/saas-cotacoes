import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { stores, user as userTable } from '@/drizzle/schema'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log('🔍 API: Buscando prestadores de serviço...')
    
    // Buscar users com businessType='servico' e juntar com stores
    const serviceProviders = await db
      .select({
        id: stores.id,
        nome: stores.nome,
        rating: stores.rating,
        plano: stores.plano,
        status: stores.status,
        slug: stores.slug,
        userId: stores.userId,
      })
      .from(stores)
      .innerJoin(userTable, eq(stores.userId, userTable.id))
      .where(
        and(
          eq(userTable.businessType, 'servico'),
          eq(stores.status, 'approved')
        )
      )
      .limit(limit)
    
    console.log('✅ API: Prestadores encontrados:', serviceProviders.length)
    
    return NextResponse.json({
      data: serviceProviders,
      total: serviceProviders.length
    })
  } catch (error) {
    console.error('Error fetching service providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service providers' },
      { status: 500 }
    )
  }
}

