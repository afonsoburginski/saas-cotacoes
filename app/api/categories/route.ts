import { NextResponse } from 'next/server'
import { mockProducts } from '@/lib/mock-data'

export async function GET() {
  const categories = Array.from(
    new Set(mockProducts.map(p => p.categoria))
  ).sort()
  
  return NextResponse.json({
    data: categories,
    total: categories.length
  })
}

