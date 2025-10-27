import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { user } from '@/drizzle/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const allUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        businessName: user.businessName,
        businessType: user.businessType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(100)

    return NextResponse.json({
      data: allUsers,
      total: allUsers.length,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

