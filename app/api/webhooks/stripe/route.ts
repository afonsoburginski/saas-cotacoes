import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/drizzle'
import { user, stores, processedWebhooks, notifications } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

const PLAN_DETAILS = {
  basico: { priority: 70 },
  plus: { priority: 85 },
  premium: { priority: 95 },
} as const;

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }
  
  try {
    // 🛡️ IDEMPOTÊNCIA: Verificar se já processamos este evento
    const [existing] = await db
      .select()
      .from(processedWebhooks)
      .where(eq(processedWebhooks.eventId, event.id))
      .limit(1)
    
    if (existing) {
      console.log('⚠️ Evento já processado:', event.id)
      return NextResponse.json({ received: true, duplicate: true })
    }
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan as keyof typeof PLAN_DETAILS | null
        
        if (!userId || !plan || !PLAN_DETAILS[plan]) {
          console.error('❌ Missing or invalid userId or plan in metadata')
          break
        }
        
        console.log('📦 Processing checkout for user:', userId, 'plan:', plan)
        
        // Pegar custom fields do Stripe
        const businessName = session.custom_fields?.find(f => f.key === 'business_name')?.text?.value
        const businessType = session.custom_fields?.find(f => f.key === 'business_type')?.dropdown?.value
        const phone = session.customer_details?.phone
        const address = session.customer_details?.address
        const stripeCustomerId = session.customer as string // ID do customer no Stripe
        const stripeSubscriptionId = session.subscription as string // ID da subscription
        
        // Formatar endereço completo
        const fullAddress = address ? 
          `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city} - ${address.state}, ${address.postal_code}` : 
          undefined
        
        // Atualizar usuário com TODOS os dados incluindo IDs do Stripe
        const [updatedUser] = await db.update(user).set({
          plan: plan,
          businessName: businessName || undefined,
          businessType: businessType as 'comercio' | 'servico' | undefined,
          phone: phone || undefined,
          address: fullAddress,
          role: 'fornecedor',
          stripeCustomerId: stripeCustomerId, // ⭐ VINCULA COM stripe_customers
          updatedAt: new Date(),
        }).where(eq(user.id, userId)).returning()
        
        console.log('✅ User updated:', updatedUser.email)
        
        // Gerar slug único do nome da empresa
        const slug = (businessName || updatedUser.name || 'empresa')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-z0-9]+/g, '-') // Substitui espaços por -
          .replace(/^-|-$/g, '') // Remove - do início e fim
          + '-' + userId.substring(0, 6) // Garante unicidade
        
        // Verificar se já existe store (renovação)
        const [existingStore] = await db
          .select()
          .from(stores)
          .where(eq(stores.userId, userId))
          .limit(1)
        
        if (existingStore) {
          // RENOVAÇÃO: Reativar store existente
          console.log('🔄 Renovação detectada - reativando store existente:', existingStore.id)
          
          const [reactivated] = await db
            .update(stores)
            .set({ 
              status: 'approved',
              plano: plan,
              priorityScore: PLAN_DETAILS[plan].priority,
              updatedAt: new Date()
            })
            .where(eq(stores.id, existingStore.id))
            .returning()
          
          console.log('✅ Store reativada:', reactivated.nome, '- Status:', reactivated.status, '- Plano:', reactivated.plano)
        } else {
          // PRIMEIRA VEZ: Criar nova store
          const [newStore] = await db.insert(stores).values({
            userId: userId,
            slug: slug,
            nome: businessName || `${updatedUser.name || 'Empresa'}`,
            email: session.customer_details?.email || undefined,
            telefone: phone || undefined,
            endereco: fullAddress,
            descricao: `${businessType === 'comercio' ? 'Comércio' : 'Prestador de serviço'} - ${businessName || 'Nova empresa'}`,
            status: 'approved',
            plano: plan,
            priorityScore: PLAN_DETAILS[plan].priority,
            rating: '0',
          }).returning()
          
          console.log('🏪 Store created:', newStore.id, newStore.nome)
        }
        
        console.log('✅ Checkout completo para user:', userId)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        console.log('🚨 Assinatura cancelada no Stripe:', subscription.id)
        
        // Buscar user pelo stripe_customer_id
        const [userData] = await db
          .select()
          .from(user)
          .where(eq(user.stripeCustomerId, customerId))
          .limit(1)
        
        if (!userData) {
          console.log('⚠️ Usuário não encontrado para o customer:', customerId)
          break
        }
        
        // Suspender loja
        await db
          .update(stores)
          .set({ status: 'suspended', updatedAt: new Date() })
          .where(eq(stores.userId, userData.id))
        
        // Criar notificação
        await db.insert(notifications).values({
          userId: userData.id,
          tipo: 'subscription_cancelled',
          titulo: 'Assinatura Cancelada',
          mensagem: 'Sua assinatura foi cancelada. Renove para continuar usando a plataforma.',
          link: '/loja/assinatura',
          isRead: false,
        })
        
        console.log('✅ Loja suspensa e notificação criada para user:', userData.id)
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('🔄 Assinatura atualizada no Stripe:', subscription.id, 'status:', subscription.status)
        
        // Se mudou para past_due (pagamento falhou)
        if (subscription.status === 'past_due') {
          const customerId = subscription.customer as string
          
          const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.stripeCustomerId, customerId))
            .limit(1)
          
          if (userData) {
            // Notificar sobre falha no pagamento
            await db.insert(notifications).values({
              userId: userData.id,
              tipo: 'payment_failed',
              titulo: 'Pagamento Pendente',
              mensagem: 'Houve um problema com seu pagamento. Atualize seu método de pagamento.',
              link: '/loja/assinatura',
              isRead: false,
            })
            
            console.log('⚠️ Notificação de pagamento falho criada para:', userData.id)
          }
        }
        
        // Se reativou (canceled → active)
        if (subscription.status === 'active') {
          const customerId = subscription.customer as string
          
          const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.stripeCustomerId, customerId))
            .limit(1)
          
          if (userData) {
            console.log('✅ Assinatura reativada para:', userData.email)
            
            // Reativar loja
            await db
              .update(stores)
              .set({ status: 'approved', updatedAt: new Date() })
              .where(eq(stores.userId, userData.id))
              .returning()
          }
        }
        
        break
      }
      
      default:
        console.log(`ℹ️ Evento não tratado: ${event.type}`)
    }
    
    // 📝 Registrar webhook como processado (idempotência)
    await db.insert(processedWebhooks).values({
      eventId: event.id,
      eventType: event.type,
      payload: event as any,
    })
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

