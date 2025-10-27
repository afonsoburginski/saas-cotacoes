import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/drizzle'
import { user as userTable } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    console.log('🔐 Callback stripe-success')
    
    if (!session?.user) {
      console.log('❌ Sem sessão')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    console.log('✅ Login confirmado:', session.user.email)
    
    // Atualizar role se necessário
    const [userData] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1)
    
    if (userData?.role !== 'fornecedor' && userData?.role !== 'loja') {
      await db.update(userTable)
        .set({ role: 'fornecedor' })
        .where(eq(userTable.id, session.user.id))
    }
    
    // Redirecionar automaticamente para stripe-success com session_id
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('session_id') || 'authenticated'
    
    console.log('🔄 Redirecionando para stripe-success')
    return NextResponse.redirect(new URL(`/checkout/stripe-success?session_id=${sessionId}`, request.url))
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

