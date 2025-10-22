import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/drizzle'
import { user as userTable } from '@/drizzle/schema'
import { eq, sql } from 'drizzle-orm'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Rotas públicas (não precisam autenticação)
  const publicPaths = ['/', '/api/auth', '/api/products', '/api/services', '/api/stores', '/api/categories', '/api/plans', '/api/webhooks', '/api/user/subscription-status', '/explorar', '/categoria', '/fornecedor', '/subscription/expired']
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }

  // Verificar sessão
  const session = await auth.api.getSession({
    headers: request.headers
  })

  // Se não está logado, redireciona para home
  if (!session?.user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const userRole = session.user.role

  // Proteção de rotas /admin - apenas admin
  if (path.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Proteção de rotas /loja/* - REQUER subscription ativa
  if (path.startsWith('/loja')) {
    // Exceções: assinatura expirada e checkout
    if (path === '/subscription/expired' || path === '/checkout') {
      return NextResponse.next()
    }
    
    // Verifica role
    if (!['fornecedor', 'loja'].includes(userRole || '')) {
      console.log('🚨 User não é fornecedor tentou acessar /loja')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // 🛡️ CRÍTICO: Validar subscription ativa
    const [userData] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1)
    
    // Sem stripe_customer_id = nunca assinou
    if (!userData?.stripeCustomerId) {
      console.log('⚠️ Fornecedor sem subscription tentou acessar /loja - redirect para /checkout')
      return NextResponse.redirect(new URL('/checkout', request.url))
    }
    
    // Verificar subscription ativa nas Foreign Tables do Stripe
    try {
      const result: any = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM stripe_subscriptions
        WHERE customer = ${userData.stripeCustomerId}
        AND attrs->>'status' = 'active'
      `)
      
      const hasActive = parseInt(result[0]?.count || '0') > 0
      
      if (!hasActive) {
        console.log('🚨 BLOQUEADO: Fornecedor sem subscription ativa → /subscription/expired')
        return NextResponse.redirect(new URL('/subscription/expired', request.url))
      }
      
      console.log('✅ Subscription ativa verificada - acesso permitido')
    } catch (error) {
      console.error('❌ Erro ao verificar subscription:', error)
      // Em caso de erro de query, bloquear acesso (fail-closed para segurança)
      return NextResponse.redirect(new URL('/subscription/expired', request.url))
    }
  }

  // Proteção de rotas consumidor - apenas consumidor/usuario
  // /explorar, /categoria, /fornecedor são públicas agora
  // /comparar desabilitado temporariamente
  const consumerPaths = ['/carrinho', '/listas'] // removido /comparar
  if (consumerPaths.some(p => path.startsWith(p)) && !['consumidor', 'usuario'].includes(userRole || '')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Onboarding: Se usuário não tem role definida, vai para onboarding
  // EXCETO na home (/) que é sempre pública
  if (path !== '/onboarding' && path !== '/checkout' && path !== '/' && !userRole) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/loja/:path*',
    '/explorar/:path*',
    '/carrinho/:path*',
    '/comparar/:path*',
    '/listas/:path*',
    '/categoria/:path*',
    '/fornecedor/:path*',
    '/onboarding',
    '/checkout',
  ]
}

