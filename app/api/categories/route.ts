import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { categories } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get('tipo') as ('produto' | 'servico') | null

    const rows = await db
      .select({ id: categories.id, nome: categories.nome, tipo: categories.tipo })
      .from(categories)
      .where(tipo ? and(eq(categories.ativo, true), eq(categories.tipo, tipo)) : eq(categories.ativo, true))

    const names = rows.map(r => r.nome).sort()

    return NextResponse.json({
      data: names,
      total: names.length,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

