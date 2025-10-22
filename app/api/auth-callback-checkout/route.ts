import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/drizzle'
import { user as userTable } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Atualizar role para fornecedor automaticamente
    await db.update(userTable)
      .set({ role: 'fornecedor', updatedAt: new Date() })
      .where(eq(userTable.id, session.user.id))
    
    // Redirecionar para checkout interno (escolher plano)
    return NextResponse.redirect(new URL('/checkout', request.url))
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

