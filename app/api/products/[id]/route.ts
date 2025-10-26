import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { products, orderItems } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: {
        ...product,
        id: product.id.toString(),
      }
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    
    const [updatedProduct] = await db
      .update(products)
      .set({
        nome: body.nome,
        categoria: body.categoria,
        preco: body.preco?.toString(),
        precoPromocional: body.precoPromocional?.toString(),
        estoque: body.estoque,
        unidadeMedida: body.unidadeMedida,
        imagemUrl: body.imagemUrl,
        ativo: body.ativo,
        destacado: body.destacado,
        sku: body.sku,
        descricao: body.descricao,
        temVariacaoPreco: body.temVariacaoPreco,
        peso: body.peso?.toString(),
        dimensoes: body.dimensoes,
      })
      .where(eq(products.id, parseInt(id)))
      .returning()
    
    return NextResponse.json({
      data: { ...updatedProduct, id: updatedProduct.id.toString() },
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const productId = parseInt(id)
    
    // 🚀 CASCADE DELETE: Deletar order_items relacionados primeiro
    try {
      await db
        .delete(orderItems)
        .where(eq(orderItems.productId, productId))
      console.log(`✅ Deletados order_items relacionados ao produto ${productId}`)
    } catch (orderItemsError) {
      console.log(`⚠️ Nenhum order_item relacionado ao produto ${productId} ou já foi deletado`)
    }
    
    // Agora pode deletar o produto
    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning()
    
    if (!deletedProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      data: { ...deletedProduct, id: deletedProduct.id.toString() },
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
