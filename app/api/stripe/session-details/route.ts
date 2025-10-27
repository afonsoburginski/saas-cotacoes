import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const session_id = searchParams.get('session_id')

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }

    // Buscar dados da sessão
    const session = await stripe.checkout.sessions.retrieve(session_id)

    return NextResponse.json({
      session_id: session.id,
      customer_email: session.customer_details?.email,
      customer_id: session.customer,
      subscription_id: session.subscription,
      payment_status: session.payment_status,
      metadata: session.metadata,
    })
  } catch (error) {
    console.error('Error fetching session details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session details' },
      { status: 500 }
    )
  }
}

