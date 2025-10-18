import { NextResponse } from 'next/server'
import { mockProducts } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const search = searchParams.get('search')
  const categoria = searchParams.get('categoria')
  const loja = searchParams.get('loja')
  const storeId = searchParams.get('storeId')
  
  let filtered = mockProducts.filter(p => p.ativo)
  
  if (search) {
    filtered = filtered.filter(p => 
      p.nome.toLowerCase().includes(search.toLowerCase())
    )
  }
  
  if (categoria) {
    filtered = filtered.filter(p => p.categoria === categoria)
  }
  
  if (loja) {
    filtered = filtered.filter(p => p.storeNome === loja)
  }
  
  if (storeId) {
    filtered = filtered.filter(p => p.storeId === storeId)
  }
  
  return NextResponse.json({
    data: filtered,
    total: filtered.length
  })
}

