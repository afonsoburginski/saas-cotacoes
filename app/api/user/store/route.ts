import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/drizzle'
import { stores } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Buscar store do usuário
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.userId, session.user.id))
      .limit(1)
    
    if (!store) {
      return NextResponse.json({ 
        storeId: null,
        hasStore: false 
      })
    }
    
    return NextResponse.json({
      storeId: store.id,
      slug: store.slug, // ⭐ Retorna slug para usar na URL
      hasStore: true,
      store: {
        id: store.id,
        slug: store.slug,
        nome: store.nome,
        email: store.email,
        telefone: store.telefone,
        plano: store.plano,
        status: store.status,
      }
    })
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    )
  }
}

