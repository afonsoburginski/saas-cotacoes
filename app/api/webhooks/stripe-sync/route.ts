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

    console.log('📦 Session completa:', JSON.stringify(session, null, 2))
    
    // Extrair stripe_customer_id corretamente
    let stripeCustomerId: string | null = null
    if (typeof session.customer === 'string') {
      stripeCustomerId = session.customer
    } else if (typeof session.customer === 'object' && session.customer?.id) {
      stripeCustomerId = session.customer.id
    }
    
    console.log('👤 Stripe Customer ID:', stripeCustomerId)

    let email = session.customer_details?.email as string | undefined
    if (!email && stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId)
        if (customer && typeof customer !== 'string') {
          email = (customer.email as string | undefined) || undefined
        }
      } catch (err) {
        console.warn('⚠️ Falha ao buscar email no Stripe Customer:', err)
      }
    }
    if (!email) {
      console.error('❌ Email não encontrado nem na sessão nem no Stripe Customer')
      return NextResponse.json({ error: 'No email found for session' }, { status: 400 })
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
        
        // IDs CORRETOS dos preços
        if (priceId === 'price_1SMZvvLW9AlKdS77OQ4Swn6g' || priceId === 'price_1SMZTiLW9AlKdS779UEZAmm0') plan = 'basico'
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

    // HARDCODE FALLBACK: Se não conseguiu detectar plano, usar "basico" como padrão
    if (!plan) {
      console.warn('⚠️ Não foi possível detectar o plano, usando "basico" como padrão')
      plan = 'basico'
    }

    // Pegar informações coletadas dos custom_fields (Payment Links)
    const customFields = (session as any).custom_fields as Array<any> | undefined
    const businessNameFromCustom = customFields?.find(f => f.key === 'business_name')?.text?.value as string | undefined
    const businessTypeFromCustom = customFields?.find(f => f.key === 'business_type')?.dropdown?.value as ('comercio' | 'servico') | undefined

    // Nome da empresa: custom_fields → customer_details.business_name → customer_details.name → fallback
    const businessName = businessNameFromCustom
      || session.customer_details?.business_name
      || session.customer_details?.name
      || 'Minha Loja'

    // Tipo do negócio: custom_fields → default 'comercio'
    const businessType = (businessTypeFromCustom || 'comercio') as 'comercio' | 'servico'

    // Telefone e endereço: tentar da sessão; se faltar e houver customer, buscar no Stripe Customer
    let phone = session.customer_details?.phone as string | undefined
    let address = session.customer_details?.address as Stripe.Address | null | undefined

    if ((!address || (!address.line1 && !address.city)) && stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId)
        if (customer && typeof customer !== 'string') {
          address = customer.address || address
          phone = (customer.phone as string | undefined) || phone
        }
      } catch (err) {
        console.warn('⚠️ Falha ao buscar Stripe Customer para completar endereço/telefone:', err)
      }
    }

    // Formatar endereço limpo (inclui line2 quando existir)
    const fullAddress = address ?
      `${address.line1 || ''}${address.line2 ? ', ' + address.line2 : ''}, ${address.city || ''} - ${address.state || ''}, ${address.postal_code || ''}`
        .replace(/^,\s*/, '')
        .replace(/,\s*$/, '')
      : undefined

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
      
      const userData: any = {
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
      }
      
      // Só adiciona se tiver customer ID
      if (stripeCustomerId) {
        userData.stripeCustomerId = stripeCustomerId
      }
      
      console.log('📝 Criando usuário:', JSON.stringify(userData, null, 2))
      
      await db.insert(userTable).values(userData)
      
      console.log('✅ Novo usuário criado:', userId)
    } else {
      userId = existingUser.id
      
      const updateData: any = {
        plan: plan,
        businessName: businessName,
        businessType: businessType,
        role: 'fornecedor',
      }
      
      // Só atualiza se for fornecido
      if (phone) updateData.phone = phone
      if (fullAddress) updateData.address = fullAddress
      if (stripeCustomerId) updateData.stripeCustomerId = stripeCustomerId
      updateData.updatedAt = new Date()
      
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
      const updateData: any = {
        status: 'approved',
        plano: plan,
        priorityScore: PLAN_DETAILS[plan].priority,
        // Manter dados da loja em sincronia com o que foi pago
        nome: businessName || existingStore.nome,
        email: email || existingStore.email,
        telefone: phone || existingStore.telefone,
        endereco: fullAddress || existingStore.endereco,
        descricao: `${businessType === 'comercio' ? 'Comércio' : 'Prestador de serviço'} - ${businessName}`,
        updatedAt: new Date(),
      }
      
      console.log('📝 Atualizando loja:', JSON.stringify(updateData, null, 2))
      
      const updatedStores = await db.update(stores)
        .set(updateData)
        .where(eq(stores.userId, userId))
        .returning()
      
      store = updatedStores[0]
      
      if (!store) {
        console.error('❌ Erro: store não encontrado após update')
        return NextResponse.json(
          { error: 'Failed to sync', details: 'Store not found after update' },
          { status: 500 }
        )
      }
      
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
        updatedAt: new Date(),
      }
      
      console.log('📝 Criando loja:', JSON.stringify(storeData, null, 2))
      
      const insertedStores = await db.insert(stores).values(storeData).returning()
      store = insertedStores[0]
      
      if (!store) {
        console.error('❌ Erro: store não retornado após insert')
        return NextResponse.json(
          { error: 'Failed to sync', details: 'Store not returned after insert' },
          { status: 500 }
        )
      }
      
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
