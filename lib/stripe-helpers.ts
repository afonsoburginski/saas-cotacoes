import { db } from '@/drizzle'
import { sql } from 'drizzle-orm'

/**
 * Busca subscription ativa do usuário nas Foreign Tables do Supabase
 */
export async function getUserActiveSubscription(stripeCustomerId: string) {
  if (!stripeCustomerId) return null
  
  try {
    const result: any = await db.execute(sql`
      SELECT 
        s.*,
        p.unit_amount,
        p.currency,
        pr.name as product_name
      FROM stripe_subscriptions s
      LEFT JOIN stripe_prices p ON s.attrs->>'default_payment_method' IS NOT NULL
      LEFT JOIN stripe_products pr ON p.product = pr.id
      WHERE s.customer = ${stripeCustomerId}
      AND s.attrs->>'status' = 'active'
      ORDER BY s.current_period_end DESC
      LIMIT 1
    `)
    
    return result[0] || null
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

/**
 * Verifica se usuário já tem subscription ativa
 */
export async function hasActiveSubscription(stripeCustomerId: string): Promise<boolean> {
  if (!stripeCustomerId) return false
  
  try {
    const result: any = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM stripe_subscriptions
      WHERE customer = ${stripeCustomerId}
      AND attrs->>'status' = 'active'
    `)
    
    const count = parseInt(result[0]?.count || '0')
    return count > 0
  } catch (error) {
    console.error('Error checking subscription:', error)
    return false
  }
}

/**
 * Busca customer do Stripe por email
 */
export async function getStripeCustomerByEmail(email: string) {
  try {
    const result = await db.execute<{ id: string; email: string; name: string }>(sql`
      SELECT *
      FROM stripe_customers
      WHERE email = ${email}
      LIMIT 1
    `)
    
    return (result as any)[0] || null
  } catch (error) {
    console.error('Error fetching customer:', error)
    return null
  }
}

/**
 * Identifica qual plano baseado no valor (unit_amount em centavos)
 */
export function identifyPlan(unitAmount: number): 'basico' | 'plus' | 'premium' | null {
  if (unitAmount === 9900) return 'basico'      // R$ 99,00
  if (unitAmount === 18999) return 'plus'        // R$ 189,99
  if (unitAmount === 24999) return 'premium'     // R$ 249,99
  return null
}

