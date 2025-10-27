import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/drizzle'
import { user as userTable, stores } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

const PLAN_DETAILS = {
  basico: { priority: 70 },
  plus: { priority: 85 },
  premium: { priority: 95 },
} as const

export async function POST(request: Request) {
  console.log('🔔 API Webhooks Sync Chamada!')
  try {
    const body = await request.json()
    const { sessionId } = body
    
    console.log('📥 Body recebido:', JSON.stringify(body, null, 2))
    
    if (!sessionId) {
      console.error('❌ sessionId não fornecido')
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    console.log('🔄 Sincronizando dados do Stripe, session:', sessionId)

    // Buscar session do Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    console.log('📦 Session data:', JSON.stringify({
      id: session.id,
      customer: session.customer,
      email: session.customer_details?.email,
      metadata: session.metadata,
      custom_fields: session.custom_fields
    }, null, 2))

    const email = session.customer_details?.email
    if (!email) {
      return NextResponse.json({ error: 'No email in session' }, { status: 400 })
    }

    // Detectar plano via subscription
    let plan: 'basico' | 'plus' | 'premium' | null = null
    const subscriptionData = session.subscription
    
    let subscriptionId: string | null = null
    if (typeof subscriptionData === 'string') {
      subscriptionId = subscriptionData
    } else if (typeof subscriptionData === 'object' && subscriptionData?.id) {
      subscriptionId = subscriptionData.id
    }
    
    console.log('🔍 Subscription ID:', subscriptionId)
    
    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        console.log('📦 Price ID from subscription:', priceId)
        
        if (priceId === 'price_1SMZvvLW9AlKdS77OQ4Swn6g') plan = 'basico'
        else if (priceId === 'price_1SMZxbLW9AlKdS77gf63b0Un') plan = 'plus'
        else if (priceId === 'price_1SMZy0LW9AlKdS771F9gwCPw') plan = 'premium'
        
        console.log('🔍 Plan detected:', priceId, '→', plan)
      } catch (err) {
        console.error('❌ Erro ao buscar subscription:', err)
      }
    }
    
    // Fallback: Tentar detectar plano via metadata
    if (!plan && session.metadata?.plan) {
      plan = session.metadata.plan as 'basico' | 'plus' | 'premium'
      console.log('🔍 Plan from metadata:', plan)
    }

    if (!plan) {
      console.error('❌ Não foi possível detectar o plano')
      return NextResponse.json({ error: 'Could not detect plan', details: 'No subscription or metadata found' }, { status: 400 })
    }

    // Pegar custom fields
    const businessName = session.custom_fields?.find(f => f.key === 'business_name')?.text?.value || 'Minha Loja'
    const businessTypeRaw = session.custom_fields?.find(f => f.key === 'business_type')?.dropdown?.value
    const businessType = (businessTypeRaw as 'comercio' | 'servico') || 'comercio'
    const phone = session.customer_details?.phone
    const address = session.customer_details?.address
    const fullAddress = address ? 
      `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city} - ${address.state}, ${address.postal_code}` : 
      undefined

    console.log('📦 Extracted data:', {
      businessName,
      businessType,
      phone,
      fullAddress,
      plan
    })

    // Buscar ou criar usuário
    let [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1)

    let userId: string

    if (!existingUser) {
      userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const userData = {
        id: userId,
        email: email,
        name: session.customer_details?.name || 'Usuário',
        emailVerified: true,
        role: 'fornecedor',
        plan: plan,
        businessName: businessName,
        businessType: businessType,
        phone: phone,
        address: fullAddress,
        stripeCustomerId: session.customer as string,
      }
      
      console.log('📝 Criando usuário:', JSON.stringify(userData, null, 2))
      
      await db.insert(userTable).values(userData)
      
      console.log('✅ Novo usuário criado:', userId)
    } else {
      userId = existingUser.id
      
      const updateData = {
        plan: plan,
        businessName: businessName,
        businessType: businessType,
        phone: phone || undefined,
        address: fullAddress,
        role: 'fornecedor',
        stripeCustomerId: session.customer as string,
        updatedAt: new Date(),
      }
      
      console.log('📝 Atualizando usuário:', JSON.stringify(updateData, null, 2))
      
      await db.update(userTable).set(updateData).where(eq(userTable.id, userId))
      
      console.log('✅ Usuário atualizado:', userId)
    }

    // Criar ou atualizar loja
    const slug = (businessName || 'loja')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + userId.substring(0, 6)

    const [existingStore] = await db
      .select()
      .from(stores)
      .where(eq(stores.userId, userId))
      .limit(1)

    let store
    if (existingStore) {
      const updateData = {
        status: 'approved',
        plano: plan,
        priorityScore: PLAN_DETAILS[plan].priority,
        updatedAt: new Date()
      }
      
      console.log('📝 Atualizando loja:', JSON.stringify(updateData, null, 2))
      
      [store] = await db.update(stores)
        .set(updateData)
        .where(eq(stores.userId, userId))
        .returning()
      
      console.log('✅ Loja atualizada:', store.id)
    } else {
      const storeData = {
        userId: userId,
        slug: slug,
        nome: businessName,
        email: email,
        telefone: phone || undefined,
        endereco: fullAddress,
        descricao: `${businessType === 'comercio' ? 'Comércio' : 'Prestador de serviço'} - ${businessName}`,
        status: 'approved',
        plano: plan,
        priorityScore: PLAN_DETAILS[plan].priority,
        rating: '0',
      }
      
      console.log('📝 Criando loja:', JSON.stringify(storeData, null, 2))
      
      [store] = await db.insert(stores).values(storeData).returning()
      
      console.log('✅ Loja criada:', store.id, store.slug)
    }

    return NextResponse.json({ 
      success: true, 
      store: { slug: store.slug, id: store.id }
    })

  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    return NextResponse.json(
      { error: 'Failed to sync', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
