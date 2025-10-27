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
    
    console.log('👤 User role:', userData?.role)
    
    // Garantir role de fornecedor
    if (userData?.role !== 'fornecedor' && userData?.role !== 'loja') {
      console.log('🔄 Atualizando role para fornecedor')
      await db.update(userTable)
        .set({ role: 'fornecedor' })
        .where(eq(userTable.id, session.user.id))
    }
    
    // Pegar a URL da página de sucesso original (do cookie ou referer)
    const referer = request.headers.get('referer')
    let redirectUrl = '/checkout/stripe-success?session_id=authenticated'
    
    if (referer && referer.includes('stripe-success')) {
      const refererUrl = new URL(referer)
      const sessionId = refererUrl.searchParams.get('session_id')
      if (sessionId) {
        redirectUrl = `/checkout/stripe-success?session_id=${sessionId}`
      }
    }
    
    console.log('🔄 Redirecionando de volta para:', redirectUrl)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
    
  } catch (error) {
    console.error('Error in auth callback:', error)
    return new Response(null, { status: 500 })
  }
}
