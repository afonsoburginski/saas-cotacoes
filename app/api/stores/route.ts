import { NextResponse } from 'next/server'
import { mockStores } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const status = searchParams.get('status')
  
  let filtered = mockStores
  
  if (status) {
    filtered = filtered.filter(s => s.status === status)
  }
  
  // Sort by priority score by default
  filtered.sort((a, b) => b.priorityScore - a.priorityScore)
  
  return NextResponse.json({
    data: filtered,
    total: filtered.length
  })
}

