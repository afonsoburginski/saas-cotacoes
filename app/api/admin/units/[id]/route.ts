import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { measurementUnits, products } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await req.json()
    const [row] = await db.update(measurementUnits).set({
      nome: body.nome,
      abreviacao: body.abreviacao,
      tipo: body.tipo,
      ativo: body.ativo,
      ordem: body.ordem,
    }).where(eq(measurementUnits.id, id)).returning()
    return NextResponse.json({ data: row })
  } catch (error) {
    console.error('Error updating unit:', error)
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    // Não há vínculo direto por FK; produtos guardam string. Remoção não altera produtos.
    await db.delete(measurementUnits).where(eq(measurementUnits.id, id))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting unit:', error)
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 })
  }
}


