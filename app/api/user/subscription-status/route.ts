import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/drizzle'
import { user } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { getUserActiveSubscription } from '@/lib/stripe-helpers'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

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
        stripeCustomerId: null,
      })
    }
    
    // Preferir Stripe SDK (evita warnings dos Foreign Tables)
    if (stripe) {
      const subs = await stripe.subscriptions.list({
        customer: userData.stripeCustomerId,
        status: 'active',
        limit: 1,
      })

      if (!subs.data.length) {
        return NextResponse.json({
          hasActiveSubscription: false,
          plan: userData.plan || null,
          status: 'inactive',
          stripeCustomerId: userData.stripeCustomerId,
        })
      }

      const sub = subs.data[0]
      const firstItem = sub.items.data[0]

      return NextResponse.json({
        hasActiveSubscription: true,
        plan: userData.plan,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end || false,
        stripeCustomerId: userData.stripeCustomerId,
        priceAmount: firstItem?.price?.unit_amount ?? null,
        currency: firstItem?.price?.currency ?? null,
        productName: firstItem?.price?.nickname ?? null,
        currentPeriodStart: sub.current_period_start ?? null,
        startDate: sub.start_date ?? null,
      })
    }

    // Fallback: Foreign Tables (pode emitir warnings nos logs do wrapper)
    const subscription: any = await getUserActiveSubscription(userData.stripeCustomerId)

    if (!subscription) {
      return NextResponse.json({
        hasActiveSubscription: false,
        plan: userData.plan || null,
        status: 'inactive',
        stripeCustomerId: userData.stripeCustomerId,
      })
    }

    const attrs = subscription.attrs as any
    return NextResponse.json({
      hasActiveSubscription: true,
      plan: userData.plan,
      status: attrs.status || 'active',
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: attrs.cancel_at_period_end || false,
      stripeCustomerId: userData.stripeCustomerId,
      priceAmount: subscription.unit_amount || null,
      currency: subscription.currency || null,
      productName: subscription.product_name || null,
      currentPeriodStart: subscription.current_period_start || null,
      startDate: subscription.start_date || null,
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}

