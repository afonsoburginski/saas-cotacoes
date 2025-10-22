import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/drizzle'
import { user } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { getUserActiveSubscription } from '@/lib/stripe-helpers'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Buscar stripe_customer_id do user
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)
    
    if (!userData?.stripeCustomerId) {
      return NextResponse.json({
        hasActiveSubscription: false,
        plan: null,
        status: 'none',
      })
    }
    
    // Buscar subscription ativa das Foreign Tables do Supabase
    const subscription = await getUserActiveSubscription(userData.stripeCustomerId)
    
    if (!subscription) {
      return NextResponse.json({
        hasActiveSubscription: false,
        plan: userData.plan || null,
        status: 'inactive',
      })
    }
    
    const attrs = subscription.attrs as any
    
    return NextResponse.json({
      hasActiveSubscription: true,
      plan: userData.plan,
      status: attrs.status || 'active',
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: attrs.cancel_at_period_end || false,
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}

