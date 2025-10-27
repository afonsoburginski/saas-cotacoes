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
    
    console.log('🔐 Auth callback stripe-success iniciado')
    
    if (!session?.user) {
      console.log('❌ Sem sessão de usuário')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    console.log('✅ Usuário logado:', session.user.email, 'ID:', session.user.id)
    
    // Buscar dados do usuário
    const [userData] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1)
    
    console.log('👤 User role:', userData?.role, 'Customer ID:', userData?.stripeCustomerId)
    
    // Garantir role de fornecedor
    if (userData?.role !== 'fornecedor' && userData?.role !== 'loja') {
      console.log('🔄 Atualizando role para fornecedor')
      await db.update(userTable)
        .set({ role: 'fornecedor', updatedAt: new Date() })
        .where(eq(userTable.id, session.user.id))
    }
    
    // Verificar se tem subscription ativa e buscar loja
    if (userData?.stripeCustomerId) {
      try {
        const result: any = await db.execute(sql`
          SELECT COUNT(*) as count
          FROM stripe_subscriptions
          WHERE customer = ${userData.stripeCustomerId}
          AND attrs->>'status' = 'active'
        `)
        
        const hasActive = parseInt(result[0]?.count || '0') > 0
        console.log('💳 Subscription ativa?', hasActive)
        
        if (hasActive) {
          console.log('✅ SUBSCRIPTION ATIVA! Buscando loja...')
          
          // Buscar slug da loja
          const [store] = await db
            .select()
            .from(stores)
            .where(eq(stores.userId, session.user.id))
            .limit(1)
          
          console.log('🏪 Loja encontrada:', store?.slug || 'nenhuma')
          
          if (store?.slug) {
            console.log('🏪 Redirecionando para loja:', store.slug)
            return NextResponse.redirect(new URL(`/loja/${store.slug}/catalogo`, request.url))
          } else {
            console.log('⚠️ Tem subscription mas não tem store - ir para /loja/loading')
            return NextResponse.redirect(new URL('/loja/loading', request.url))
          }
        } else {
          console.log('⚠️ Sem subscription ativa - redirecionando para /loja/loading')
          return NextResponse.redirect(new URL('/loja/loading', request.url))
        }
      } catch (error) {
        console.error('❌ Erro ao verificar subscription:', error)
        return NextResponse.redirect(new URL('/loja/loading', request.url))
      }
    } else {
      console.log('⚠️ Sem customer ID - aguardando webhook processar')
      // Aguardar webhook processar - ir para /loja/loading que vai tentar buscar a loja
      return NextResponse.redirect(new URL('/loja/loading', request.url))
    }
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
