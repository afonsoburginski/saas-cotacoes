import { NextResponse } from 'next/server'
import { mockStores } from '@/lib/mock-data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const store = mockStores.find(s => s.id === params.id)
  
  if (!store) {
    return NextResponse.json(
      { error: 'Store not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({ data: store })
}

