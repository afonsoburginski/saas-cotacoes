import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { getStripeCustomerByEmail, hasActiveSubscription } from '@/lib/stripe-helpers'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Verificar se Stripe está configurado
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }
    
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { plan } = body as { plan: 'basico' | 'plus' | 'premium' }
    
    console.log('📦 Checkout request body:', body)
    console.log('📋 Plan recebido:', plan)
    
    if (!plan) {
      console.log('❌ Plan não fornecido!')
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      )
    }
    
    // 🛡️ PROTEÇÃO: Verificar se já tem subscription ativa
    const existingCustomer = await getStripeCustomerByEmail(session.user.email)
    
    if (existingCustomer) {
      const hasActive = await hasActiveSubscription((existingCustomer as any).id)
      
      if (hasActive) {
        console.log('🚨 BLOQUEADO: User tentou criar 2ª subscription')
        return NextResponse.json(
          { error: 'Você já possui uma assinatura ativa. Gerencie em Minha Assinatura.' },
          { status: 409 } // 409 Conflict
        )
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
          price: product.default_price as string,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        plan: plan,
      },
      // Coletar dados adicionais no Stripe
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
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
    })
    
    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

