import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { categories, products, services } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await _req.json()
    const [row] = await db
      .update(categories)
      .set({
        nome: body.nome,
        tipo: body.tipo,
        descricao: body.descricao,
        icone: body.icone,
        ativo: body.ativo,
        ordem: body.ordem,
      })
      .where(eq(categories.id, id))
      .returning()
    return NextResponse.json({ data: row })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    // Buscar a categoria para obter o nome e tipo
    const [cat] = await db.select().from(categories).where(eq(categories.id, id))
    if (cat) {
      // Desvincular produtos/serviços que usam essa categoria
      if (cat.tipo === 'produto') {
        await db.update(products)
          .set({ categoria: '' })
          .where(and(eq(products.categoria, cat.nome)))
      } else if (cat.tipo === 'servico') {
        await db.update(services)
          .set({ categoria: '' })
          .where(and(eq(services.categoria, cat.nome)))
      }
    }
    await db.delete(categories).where(eq(categories.id, id))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}


