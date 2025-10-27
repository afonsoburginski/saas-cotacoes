import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { getStripeCustomerByEmail, hasActiveSubscription } from '@/lib/stripe-helpers'

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
    let customerId: string | undefined = undefined
    
    if (existingCustomer) {
      customerId = (existingCustomer as any).id
      console.log('💳 Customer existente encontrado:', customerId)
      
      const hasActive = customerId ? await hasActiveSubscription(customerId) : false
      
      if (hasActive) {
        console.log('🚨 BLOQUEADO: User tentou criar 2ª subscription')
        return NextResponse.json(
          { error: 'Você já possui uma assinatura ativa. Gerencie em Minha Assinatura.' },
          { status: 409 } // 409 Conflict
        )
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
    
    // 🎯 PEGAR O PREÇO PADRÃO DO PRODUTO (default_price)
    let priceId: string | undefined = undefined
    
    // Tentar usar o default_price (preço oficial do produto)
    if (product.default_price && typeof product.default_price === 'string') {
      priceId = product.default_price
    } else if (product.default_price && typeof product.default_price === 'object') {
      priceId = product.default_price.id
    }
    
    // Se não tem default_price, buscar TODOS os preços (ativos OU arquivados)
    if (!priceId) {
      const prices = await stripe.prices.list({
        product: stripeProductId,
        limit: 100,
      })
      
      // Ordenar por valor (MAIS BARATO primeiro) - preços promocionais
      prices.data.sort((a: any, b: any) => (a.unit_amount || 0) - (b.unit_amount || 0))
      
      priceId = prices.data[0]?.id
      
      if (!priceId) {
        return NextResponse.json(
          { error: 'No price found for this product' },
          { status: 400 }
        )
      }
    }
    
    const latestPrice = await stripe.prices.retrieve(priceId)
    console.log('💵 Usando preço:', latestPrice.id, latestPrice.unit_amount)
    
    // Criar Stripe Checkout Session usando o PREÇO CORRETO
    const checkoutSession = await stripe.checkout.sessions.create({
      ...(customerId ? { customer: customerId } : { customer_email: session.user.email }),
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // ✅ Usar o priceId correto
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
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
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

