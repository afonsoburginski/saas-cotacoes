import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { products, services } from '@/drizzle/schema'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Pegar categorias de produtos
    const productCategories = await db
      .selectDistinct({ categoria: products.categoria })
      .from(products)
      .where(sql`${products.ativo} = true`)
    
    // Pegar categorias de serviços
    const serviceCategories = await db
      .selectDistinct({ categoria: services.categoria })
      .from(services)
      .where(sql`${services.ativo} = true`)
    
    // Combinar e remover duplicatas
    const allCategories = [
      ...productCategories.map(c => c.categoria),
      ...serviceCategories.map(c => c.categoria),
    ]
    
    const uniqueCategories = Array.from(new Set(allCategories)).sort()
    
    return NextResponse.json({
      data: uniqueCategories,
      total: uniqueCategories.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

