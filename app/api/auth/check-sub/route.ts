import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/drizzle'
import { user as userTable } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      return NextResponse.json({ isActive: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    // Buscar stripeCustomerId e plano do usuário
    const [userData] = await db
      .select({ 
        stripeCustomerId: userTable.stripeCustomerId,
        plan: userTable.plan 
      })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1)
    
    if (!userData?.stripeCustomerId) {
      return NextResponse.json({ isActive: false, reason: 'No Stripe customer ID' })
    }
    
    if (!stripe) {
      console.warn('Stripe not configured, denying access.')
      return NextResponse.json({ isActive: false, error: 'Stripe not configured' }, { status: 503 })
    }
    
    // Verificar subscription ativa via Stripe SDK
    const subs = await stripe.subscriptions.list({
      customer: userData.stripeCustomerId,
      status: 'active',
      limit: 1,
    })
    
    const hasActive = subs.data.length > 0
    
    if (hasActive) {
      const sub = subs.data[0]
      return NextResponse.json({
        isActive: true,
        plan: userData.plan,
        status: sub.status,
        subscriptionId: sub.id,
        currentPeriodEnd: sub.current_period_end,
        currentPeriodStart: sub.current_period_start,
        startDate: sub.start_date,
        stripeCustomerId: userData.stripeCustomerId,
        collectionMethod: sub.collection_method,
        cancelAt: sub.cancel_at,
      })
    }
    
    return NextResponse.json({ isActive: false, stripeCustomerId: userData.stripeCustomerId })
  } catch (error) {
    console.error('❌ Erro em /api/auth/check-sub:', error)
    return NextResponse.json({ isActive: false, error: 'Internal server error' }, { status: 500 })
  }
}
