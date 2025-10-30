import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { categories } from '@/drizzle/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.tipo), asc(categories.ordem), asc(categories.nome))
    return NextResponse.json({ data: rows, total: rows.length })
  } catch (error) {
    console.error('Error fetching admin categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nome, tipo, descricao, icone, ativo = true, ordem = 0 } = body || {}
    if (!nome || !tipo) {
      return NextResponse.json({ error: 'nome and tipo are required' }, { status: 400 })
    }
    const [row] = await db
      .insert(categories)
      .values({ nome, tipo, descricao, icone, ativo, ordem })
      .returning()
    return NextResponse.json({ data: row })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}


