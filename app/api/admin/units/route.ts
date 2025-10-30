import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { measurementUnits } from '@/drizzle/schema'
import { asc, eq } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db.select().from(measurementUnits).orderBy(asc(measurementUnits.ordem), asc(measurementUnits.nome))
    return NextResponse.json({ data: rows, total: rows.length })
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nome, abreviacao, tipo, ativo = true, ordem = 0 } = body || {}
    if (!nome || !abreviacao || !tipo) {
      return NextResponse.json({ error: 'nome, abreviacao e tipo são obrigatórios' }, { status: 400 })
    }
    const [row] = await db.insert(measurementUnits).values({ nome, abreviacao, tipo, ativo, ordem }).returning()
    return NextResponse.json({ data: row })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}


