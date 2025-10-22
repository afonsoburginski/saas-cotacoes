import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { reviews } from "@/drizzle/schema"
import { eq, and, desc } from "drizzle-orm"

// GET /api/reviews?storeId=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")
    
    if (!storeId) {
      return NextResponse.json({ error: "storeId é obrigatório" }, { status: 400 })
    }

    const storeReviews = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        userName: reviews.userName,
        storeId: reviews.storeId,
        rating: reviews.rating,
        comentario: reviews.comentario,
        status: reviews.status,
        verified: reviews.verified,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.storeId, parseInt(storeId)),
          eq(reviews.status, 'aprovado') // Só avaliações aprovadas
        )
      )
      .orderBy(desc(reviews.createdAt))

    return NextResponse.json({
      success: true,
      data: storeReviews,
      total: storeReviews.length
    })
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, rating, comentario, userId, userName } = body

    if (!storeId || !rating || !userId) {
      return NextResponse.json(
        { error: "storeId, rating e userId são obrigatórios" },
        { status: 400 }
      )
    }

    const newReview = await db
      .insert(reviews)
      .values({
        storeId: parseInt(storeId),
        userId,
        userName: userName || 'Usuário Anônimo',
        rating: parseInt(rating),
        comentario: comentario || null,
        status: 'pendente', // Aguarda aprovação
        verified: false,
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newReview[0],
      message: "Avaliação enviada para aprovação"
    })
  } catch (error) {
    console.error("Erro ao criar avaliação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
