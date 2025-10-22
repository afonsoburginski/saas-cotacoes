import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { getStripeCustomerByEmail, hasActiveSubscription } from '@/lib/stripe-helpers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan') as 'basico' | 'plus' | 'premium'
    
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }
    
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Verificar se usuário já tem subscription ativa
    const existingCustomer = await getStripeCustomerByEmail(session.user.email)
    
    if (existingCustomer) {
      const hasActive = await hasActiveSubscription((existingCustomer as any).id)
      
      if (hasActive) {
        console.log('⚠️ User já tem subscription ativa')
        return NextResponse.redirect(new URL('/loja/catalogo?error=already_subscribed', request.url))
      }
    }
    
    // IDs dos produtos do Stripe
    const STRIPE_PRODUCT_IDS: Record<string, string> = {
      'basico': 'prod_TGr7IAyhlL35IF',
      'plus': 'prod_TGr7gRQ0OaIzxo',
      'premium': 'prod_TGr9sPpDEtFQ61',
    }
    
    const stripeProductId = STRIPE_PRODUCT_IDS[plan]
    
    if (!stripeProductId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    
    // Buscar produto do Stripe
    const product = await stripe.products.retrieve(stripeProductId)
    const price = await stripe.prices.retrieve(product.default_price as string)
    
    // Criar Stripe Checkout Session usando o Price do produto
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.default_price as string, // Usa o price configurado no Stripe
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        plan: plan,
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      custom_fields: [
        {
          key: 'business_name',
          label: { type: 'custom', custom: 'Nome da Empresa' },
          type: 'text',
        },
        {
          key: 'business_type',
          label: { type: 'custom', custom: 'Tipo de Negócio' },
          type: 'dropdown',
          dropdown: {
            options: [
              { label: 'Comércio (Loja Física)', value: 'comercio' },
              { label: 'Prestador de Serviço', value: 'servico' },
            ],
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?cancelled=true`,
    })
    
    // Redirecionar para Stripe
    return NextResponse.redirect(checkoutSession.url!)
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}

