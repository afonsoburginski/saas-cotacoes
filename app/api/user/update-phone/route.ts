import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/drizzle"
import { user } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { phone } = await request.json()

    if (!phone || phone.trim() === '') {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 })
    }

    // Atualizar o telefone do usuário
    const [updatedUser] = await db
      .update(user)
      .set({ phone: phone.trim() })
      .where(eq(user.id, session.user.id))
      .returning()

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log('📱 Telefone atualizado para usuário:', session.user.email, 'Telefone:', phone)

    return NextResponse.json({
      success: true,
      data: { phone: updatedUser.phone }
    })

  } catch (error) {
    console.error("Error updating user phone:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
