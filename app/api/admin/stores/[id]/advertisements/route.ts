import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { storeAdvertisements } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

// GET - Buscar publicidade de uma loja
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = Number(params.id)
    
    const [advertisement] = await db
      .select()
      .from(storeAdvertisements)
      .where(eq(storeAdvertisements.storeId, storeId))
      .limit(1)

    if (!advertisement) {
      return NextResponse.json({ 
        data: null,
        images: []
      })
    }

    return NextResponse.json({
      data: advertisement,
      images: advertisement.images || []
    })
  } catch (error) {
    console.error('Error fetching advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to fetch advertisement' },
      { status: 500 }
    )
  }
}

// POST - Criar ou atualizar publicidade de uma loja
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = Number(params.id)
    const body = await req.json()
    
    const { images, startDate, endDate, active, link } = body

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images must be an array' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma publicidade para esta loja
    const [existing] = await db
      .select()
      .from(storeAdvertisements)
      .where(eq(storeAdvertisements.storeId, storeId))
      .limit(1)

    let result

    if (existing) {
      // Atualizar publicidade existente
      const [updated] = await db
        .update(storeAdvertisements)
        .set({
          images: images,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          active: active !== undefined ? active : true,
          link: link || null,
          updatedAt: new Date(),
        })
        .where(eq(storeAdvertisements.id, existing.id))
        .returning()

      result = updated
    } else {
      // Criar nova publicidade
      const [created] = await db
        .insert(storeAdvertisements)
        .values({
          storeId: storeId,
          images: images,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          active: active !== undefined ? active : true,
          link: link || null,
        })
        .returning()

      result = created
    }

    return NextResponse.json({ 
      data: result,
      success: true 
    })
  } catch (error) {
    console.error('Error saving advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to save advertisement' },
      { status: 500 }
    )
  }
}

