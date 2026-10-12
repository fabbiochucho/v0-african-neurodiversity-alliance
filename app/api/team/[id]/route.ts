import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"

// DELETE /api/team/[id] -- owner removes a member/invite, or a member leaves.
// RLS (support_team_delete) decides which rows the caller may delete.
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase.from("support_team_members").delete().eq("id", params.id).select("id")
  if (error) return dbErrorResponse(error)
  if (!data || data.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ ok: true })
}

// POST /api/team/[id] -- accept an invite addressed to the caller's email.
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabase.rpc("accept_support_team_invite", { invite_id: params.id })
  if (error) return dbErrorResponse(error, 404)

  return NextResponse.json({ ok: true })
}
