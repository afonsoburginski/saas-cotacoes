import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { user as userTable } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const businessType = body?.businessType as 'comercio' | 'servico' | undefined

    if (!id || (businessType !== 'comercio' && businessType !== 'servico')) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const [updated] = await db
      .update(userTable)
      .set({ businessType, updatedAt: new Date() })
      .where(eq(userTable.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, userId: id, businessType })
  } catch (error) {
    console.error('Error updating business type:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


