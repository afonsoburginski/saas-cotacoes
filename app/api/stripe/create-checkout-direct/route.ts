import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { getStripeCustomerByEmail, hasActiveSubscription } from '@/lib/stripe-helpers'

export const dynamic = 'force-dynamic'

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
    let customerId: string | undefined = undefined
    
    if (existingCustomer) {
      const existingId = (existingCustomer as any).id as string
      customerId = existingId
      console.log('💳 Customer existente encontrado:', customerId)
      
      const hasActive = await hasActiveSubscription(existingId)
      
      if (hasActive) {
        console.log('⚠️ User já tem subscription ativa')
        return NextResponse.redirect(new URL('/loja/catalogo?error=already_subscribed', request.url))
      }
      
      console.log('✅ Customer existe mas sem subscription ativa - pode renovar')
    } else {
      console.log('📝 Novo customer será criado no checkout')
    }
    
    // IDs REAIS dos produtos do Stripe (da tabela wrapper)
    const STRIPE_PRODUCT_IDS: Record<string, string> = {
      'basico': 'prod_TJBr74CwsQFrbo',
      'plus': 'prod_TJBvLbpuSMhCU4',
      'premium': 'prod_TJBxi7usfzf57O',
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
      ...(customerId ? { customer: customerId } : { customer_email: session.user.email }),
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

