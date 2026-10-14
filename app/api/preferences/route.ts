import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { fromRow, parsePreferences, toRow } from "@/lib/preferences"

// GET /api/preferences -- the signed-in user's saved display preferences (or null).
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ preferences: null })

  const { data } = await supabase
    .from("user_preferences")
    .select("visual, motion, text_size, contrast, density")
    .eq("user_id", user.id)
    .maybeSingle()
  return NextResponse.json({ preferences: fromRow(data) })
}

// PUT /api/preferences -- save for the signed-in user (RLS: own row only).
export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const prefs = parsePreferences(await request.json().catch(() => null))
  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: user.id, ...toRow(prefs), updated_at: new Date().toISOString() })
  if (error) return dbErrorResponse(error)
  return NextResponse.json({ preferences: prefs })
}
