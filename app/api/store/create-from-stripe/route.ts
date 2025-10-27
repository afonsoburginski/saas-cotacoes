import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/drizzle'
import { user, stores } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

const PLAN_MAPPING = {
  'price_1SMZvvLW9AlKdS77OQ4Swn6g': { plan: 'basico', priority: 70 },
  'price_1SMZxbLW9AlKdS77gf63b0Un': { plan: 'plus', priority: 85 },
  'price_1SMZy0LW9AlKdS771F9gwCPw': { plan: 'premium', priority: 95 },
} as const

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { session_id, customer_email, customer_id, subscription_id } = body

    if (!session_id || !customer_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Buscar detalhes da subscription para pegar o plano
    const subscription = await stripe.subscriptions.retrieve(subscription_id as string)
    const priceId = subscription.items.data[0]?.price?.id
    
    if (!priceId || !(priceId in PLAN_MAPPING)) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      )
    }

    const planDetails = PLAN_MAPPING[priceId as keyof typeof PLAN_MAPPING]
    
    // Buscar ou criar usuário
    let userId: string

    // Verificar se usuário já existe pelo email
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, customer_email))
      .limit(1)

    if (existingUser) {
      userId = existingUser.id
      
      // Atualizar com dados do Stripe
      await db.update(user).set({
        stripeCustomerId: customer_id,
        plan: planDetails.plan,
        role: 'fornecedor',
      }).where(eq(user.id, userId))
    } else {
      // Criar novo usuário
      // Como não temos senha, vamos criar um usuário provisório
      // que será atualizado no próximo login
      return NextResponse.json(
        { error: 'User must be created manually' },
        { status: 400 }
      )
    }

    // Verificar se já existe loja
    const [existingStore] = await db
      .select()
      .from(stores)
      .where(eq(stores.userId, userId))
      .limit(1)

    if (existingStore) {
      // Atualizar loja existente
      await db.update(stores).set({
        status: 'approved',
        plano: planDetails.plan,
        priorityScore: planDetails.priority,
      }).where(eq(stores.id, existingStore.id))

      return NextResponse.json({
        message: 'Store updated',
        slug: existingStore.slug,
      })
    }

    // Criar nova loja
    const slug = `loja-${userId.substring(0, 8)}`
    
    const [newStore] = await db.insert(stores).values({
      userId: userId,
      slug: slug,
      nome: customer_email.split('@')[0],
      email: customer_email,
      status: 'approved',
      plano: planDetails.plan,
      priorityScore: planDetails.priority,
      rating: '0',
    }).returning()

    return NextResponse.json({
      message: 'Store created',
      slug: newStore.slug,
    })
  } catch (error) {
    console.error('Error creating store from Stripe:', error)
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    )
  }
}

