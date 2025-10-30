import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/drizzle'
import { user as userTable, stores } from '@/drizzle/schema'
import { eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    console.log('🔐 Auth callback checkout - User:', session.user.email)
    
    // Buscar dados do usuário
    const [userData] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1)
    
    console.log('👤 User role:', userData?.role, 'Customer ID:', userData?.stripeCustomerId)
    
    // ✅ CURTO-CIRCUITO: se já existe loja com slug, manda direto para a loja
    try {
      const [existingStore] = await db
        .select()
        .from(stores)
        .where(eq(stores.userId, session.user.id))
        .limit(1)

      if (existingStore?.slug) {
        // Garante role correta mas não bloqueia redirect
        if (userData?.role !== 'fornecedor' && userData?.role !== 'loja') {
          await db.update(userTable)
            .set({ role: 'fornecedor', updatedAt: new Date() })
            .where(eq(userTable.id, session.user.id))
        }
        return NextResponse.redirect(new URL(`/loja/${existingStore.slug}`, request.url))
      }
    } catch (e) {
      // segue o fluxo normal abaixo
    }

    // 🔍 Verificar se tem subscription ativa (caso ainda não tenha store)
    if (userData?.stripeCustomerId) {
      console.log('💳 Tem customer ID - verificando subscription...')
      
      try {
        const result: any = await db.execute(sql`
          SELECT COUNT(*) as count
          FROM stripe_subscriptions
          WHERE customer = ${userData.stripeCustomerId}
          AND attrs->>'status' = 'active'
        `)
        
        const hasActive = parseInt(result[0]?.count || '0') > 0
        
        if (hasActive) {
          console.log('✅ SUBSCRIPTION ATIVA! É cliente pagante!')
          
          // Garantir que tem role correto
          if (userData.role !== 'fornecedor' && userData.role !== 'loja') {
            await db.update(userTable)
              .set({ role: 'fornecedor', updatedAt: new Date() })
              .where(eq(userTable.id, session.user.id))
          }
          
          // Buscar slug da loja
          const [store] = await db
            .select()
            .from(stores)
            .where(eq(stores.userId, session.user.id))
            .limit(1)
          
          if (store?.slug) {
            console.log('🏪 Redirecionando para loja:', store.slug)
            return NextResponse.redirect(new URL(`/loja/${store.slug}`, request.url))
          } else {
            console.log('⚠️ Tem subscription mas não tem store - ir pro checkout')
          }
        } else {
          console.log('⚠️ Customer existe mas subscription não ativa')
        }
      } catch (error) {
        console.error('Erro ao verificar subscription:', error)
      }
    }
    
    // Não tem subscription ativa - ir pro checkout
    console.log('📍 Sem subscription ativa - indo para checkout')
    
    await db.update(userTable)
      .set({ role: 'fornecedor', updatedAt: new Date() })
      .where(eq(userTable.id, session.user.id))
    
    return NextResponse.redirect(new URL('/checkout', request.url))
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

