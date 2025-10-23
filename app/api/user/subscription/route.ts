import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }
    
    // Buscar subscription ativa do usuário no Stripe pelo email
    const subscriptions = await stripe.subscriptions.list({
      customer: undefined, // Vamos buscar pelo email nos customers
      limit: 10,
    })
    
    // Buscar customer pelo email
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    })
    
    if (customers.data.length === 0) {
      return NextResponse.json({
        hasSubscription: false,
        plan: null,
        status: null,
      })
    }
    
    // Buscar subscriptions do customer
    const customerSubscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1,
    })
    
    if (customerSubscriptions.data.length === 0) {
      return NextResponse.json({
        hasSubscription: false,
        plan: null,
        status: null,
      })
    }
    
    const subscription = customerSubscriptions.data[0]
    const priceId = subscription.items.data[0]?.price.id
    
    // Identificar qual plano baseado no valor ou metadata
    let planName = 'unknown'
    const amount = subscription.items.data[0]?.price.unit_amount || 0
    
    if (amount === 9900) planName = 'basico'
    else if (amount === 18999) planName = 'plus'
    else if (amount === 24999) planName = 'premium'
    
    return NextResponse.json({
      hasSubscription: true,
      plan: planName,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

