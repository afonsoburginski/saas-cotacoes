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
    
    // O login aconteceu no dialog, não precisa redirecionar!
    // A página de sucesso já vai detectar a sessão e mostrar o botão "Ir para Minha Loja"
    console.log('✅ Login confirmado, usuário permanece na página')
    return new Response(null, { status: 200 })
    
  } catch (error) {
    console.error('Error in auth callback:', error)
    return new Response(null, { status: 500 })
  }
}
