import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { products, stores } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [product] = await db
      .select({
        id: products.id,
        storeId: products.storeId,
        storeNome: stores.nome,
        nome: products.nome,
        categoria: products.categoria,
        preco: products.preco,
        precoPromocional: products.precoPromocional,
        estoque: products.estoque,
        unidadeMedida: products.unidadeMedida,
        rating: products.rating,
        imagemUrl: products.imagemUrl,
        imagens: products.imagens,
        ativo: products.ativo,
        destacado: products.destacado,
        sku: products.sku,
        descricao: products.descricao,
        temVariacaoPreco: products.temVariacaoPreco,
        peso: products.peso,
        dimensoes: products.dimensoes,
      })
      .from(products)
      .leftJoin(stores, eq(products.storeId, stores.id))
      .where(eq(products.id, parseInt(params.id)))
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    const formatted = {
      ...product,
      id: product.id.toString(),
      storeId: product.storeId.toString(),
      preco: parseFloat(product.preco as string),
      precoPromocional: product.precoPromocional ? parseFloat(product.precoPromocional as string) : undefined,
      rating: parseFloat(product.rating as string || '0'),
      peso: product.peso ? parseFloat(product.peso as string) : undefined,
      imagens: product.imagens as string[] || [],
      dimensoes: product.dimensoes as any,
    }
    
    return NextResponse.json({ data: formatted })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updateData: any = {
      updatedAt: sql`now()`,
    }
    
    if (body.nome !== undefined) updateData.nome = body.nome
    if (body.categoria !== undefined) updateData.categoria = body.categoria
    if (body.preco !== undefined) updateData.preco = body.preco.toString()
    if (body.estoque !== undefined) updateData.estoque = body.estoque
    if (body.ativo !== undefined) updateData.ativo = body.ativo
    if (body.destacado !== undefined) updateData.destacado = body.destacado
    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.descricao !== undefined) updateData.descricao = body.descricao
    if (body.temVariacaoPreco !== undefined) updateData.temVariacaoPreco = body.temVariacaoPreco
    if (body.unidadeMedida !== undefined) updateData.unidadeMedida = body.unidadeMedida
    if (body.imagemUrl !== undefined) updateData.imagemUrl = body.imagemUrl
    if (body.imagens !== undefined) updateData.imagens = body.imagens
    
    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(params.id)))
      .returning()
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: { ...updated, id: updated.id.toString() },
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, parseInt(params.id)))
      .returning()
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: { ...deleted, id: deleted.id.toString() },
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}


