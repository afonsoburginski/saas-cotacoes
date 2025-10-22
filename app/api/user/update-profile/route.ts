import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/drizzle'
import { user } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Campos permitidos para atualização
    const allowedFields: Record<string, any> = {}
    if (body.phone !== undefined) allowedFields.phone = body.phone
    if (body.businessName !== undefined) allowedFields.businessName = body.businessName
    if (body.businessType !== undefined) allowedFields.businessType = body.businessType
    if (body.plan !== undefined) allowedFields.plan = body.plan
    if (body.address !== undefined) allowedFields.address = body.address
    
    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    // Atualizar no banco
    allowedFields.updatedAt = new Date()
    
    const [updated] = await db
      .update(user)
      .set(allowedFields)
      .where(eq(user.id, session.user.id))
      .returning()
    
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

