import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { measurementUnits } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get('tipo') as ('unit' | 'length' | 'area' | 'volume' | 'weight' | 'time' | 'package') | null

    const rows = await db
      .select({ id: measurementUnits.id, nome: measurementUnits.nome, abreviacao: measurementUnits.abreviacao, tipo: measurementUnits.tipo })
      .from(measurementUnits)
      .where(tipo ? and(eq(measurementUnits.ativo, true), eq(measurementUnits.tipo, tipo)) : eq(measurementUnits.ativo, true))

    return NextResponse.json({ data: rows, total: rows.length })
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}


