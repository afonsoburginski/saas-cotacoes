import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { stores } from '@/drizzle/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const allStores = await db
      .select()
      .from(stores)
      .orderBy(desc(stores.createdAt))
      .limit(100)

    return NextResponse.json({
      data: allStores,
      total: allStores.length,
    })
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}

