import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    // Buscar produtos do Stripe via Foreign Tables
    const result: any = await db.execute(sql`
      SELECT 
        p.id,
        p.name,
        pr.unit_amount,
        pr.currency,
        p.attrs
      FROM stripe_products p
      LEFT JOIN stripe_prices pr ON p.default_price = pr.id
      WHERE p.active = true
      ORDER BY pr.unit_amount ASC
    `)
    
    const formatted = result.map((plan: any) => {
      const metadata = plan.attrs?.metadata || {}
      const features = metadata.features ? JSON.parse(metadata.features) : []
      const planId = metadata.plan_id || plan.name.toLowerCase()
      
      return {
        id: plan.id,
        nome: plan.name,
        preco: (plan.unit_amount || 0) / 100, // Stripe usa centavos
        periodicidade: 'mensal',
        recursos: features,
        ativo: true,
        stripeProductId: plan.id,
        stripePriceId: null, // Pode buscar se necessário
      }
    })
    
    return NextResponse.json({
      data: formatted,
      total: formatted.length
    })
  } catch (error) {
    console.error('Error fetching plans from Stripe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

