import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET() {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }

    // IDs REAIS dos planos da tabela stripe_products wrapper
    // Payment Links (links promocionais - não usados na landing page):
    // Básico: https://buy.stripe.com/5kQfZiey0fBw7I0dlNfw400
    // Plus: https://buy.stripe.com/5kQ9AU61uahcd2kftVfw401
    // Premium: https://buy.stripe.com/00wfZi75yblgaUc4Phfw402
    const PLANS = [
      { id: 'basico', name: 'Básico', stripeProductId: 'prod_TJBr74CwsQFrbo', icon: 'store', description: 'Ideal para pequenas empresas começando' },
      { id: 'plus', name: 'Plus', stripeProductId: 'prod_TJBvLbpuSMhCU4', icon: 'rocket', description: 'Para empresas crescerem rápido' },
      { id: 'premium', name: 'Premium', stripeProductId: 'prod_TJBxi7usfzf57O', icon: 'video', description: 'Vídeos e campanhas avançadas' },
    ]

    const plansWithPrices = await Promise.all(
      PLANS.map(async (plan) => {
        try {
          // Buscar produto
          const product = await stripe.products.retrieve(plan.stripeProductId)
          
          // 🎯 PEGAR O PREÇO PADRÃO do produto (default_price)
          let priceId: string | undefined = product.default_price as string
          
          if (!priceId) {
            // Se não tem default_price, buscar o preço mais barato ativo
            const prices = await stripe.prices.list({
              product: plan.stripeProductId,
              active: true,
              limit: 100,
            })
            
            prices.data.sort((a: any, b: any) => (a.unit_amount || 0) - (b.unit_amount || 0))
            priceId = prices.data[0]?.id
          }
          
          if (!priceId) {
            console.error(`❌ No price found for product ${product.name}`)
            return null
          }
          
          // Buscar detalhes do preço padrão
          const defaultPrice = await stripe.prices.retrieve(priceId)
          
          // Buscar features da metadata do Stripe (vem como string JSON!)
          const metadata = product.metadata || {}
          let features: string[] = []
          
          // Parse das features (vem como string JSON no Stripe metadata)
          if (metadata.features) {
            try {
              // Pode vir como string JSON ou já como array
              if (typeof metadata.features === 'string') {
                features = JSON.parse(metadata.features)
              } else if (Array.isArray(metadata.features)) {
                features = metadata.features
              }
            } catch (error) {
              console.error('Erro ao parsear features:', error)
              features = []
            }
          }
          
          console.log(`📋 Produto ${product.name} - Features:`, features)
          console.log(`💰 Preço padrão: ${defaultPrice.id} - R$ ${(defaultPrice.unit_amount || 0) / 100}`)
          
          return {
            id: plan.id,
            nome: product.name, // ✅ Nome direto do Stripe
            preco: (defaultPrice.unit_amount || 0) / 100,
            precoFormatted: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((defaultPrice.unit_amount || 0) / 100),
            periodicidade: 'mensal',
            ativo: true,
            stripeProductId: product.id, // ✅ ID direto do Stripe
            stripePriceId: defaultPrice.id, // ✅ Preço PADRÃO
            // paymentLink removido - usado apenas em campanhas externas
            icon: plan.icon,
            description: product.description || plan.description, // ✅ Descrição do Stripe ou fallback
            features: features, // ✅ Features vindas da metadata do Stripe
          }
        } catch (error) {
          console.error(`Error fetching plan ${plan.name}:`, error)
          return null
        }
      })
    )

    const validPlans = plansWithPrices.filter(p => p !== null)

    return NextResponse.json({
      data: validPlans,
      total: validPlans.length
    })
  } catch (error) {
    console.error('Error fetching plans from Stripe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

