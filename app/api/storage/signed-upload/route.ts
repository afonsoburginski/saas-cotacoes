import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { auth } from "@/lib/auth"

// POST /api/storage/signed-upload
// body: { bucket?: string, path: string, contentType?: string }
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const bucket = (body.bucket as string) || "images"
    const path = body.path as string
    const minutes = Number(body.expiresInMinutes) || 10

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Ensure folder prefix safety
    const safePath = path.replace(/^\/+/, "")

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(safePath, { upsert: true, expiresIn: minutes * 60 })

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Failed to create signed URL" }, { status: 500 })
    }

    return NextResponse.json({
      url: data.signedUrl,
      path: data.path,
      token: data.token,
      bucket,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}


