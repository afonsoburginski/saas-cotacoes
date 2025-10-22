import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/drizzle'
import { user as userTable } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan')
    
    if (!plan) {
      return NextResponse.redirect(new URL('/checkout', request.url))
    }
    
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    console.log('🔄 Auth callback - plan:', plan, 'user:', session.user.email)
    
    // Atualizar role para fornecedor automaticamente
    await db.update(userTable)
      .set({ role: 'fornecedor', updatedAt: new Date() })
      .where(eq(userTable.id, session.user.id))
    
    console.log('✅ Role atualizado para fornecedor')
    
    // Redirecionar para criar checkout do Stripe
    return NextResponse.redirect(new URL(`/api/stripe/create-checkout-direct?plan=${plan}`, request.url))
  } catch (error) {
    console.error('❌ Error in auth callback:', error)
    return NextResponse.redirect(new URL('/checkout', request.url))
  }
}

