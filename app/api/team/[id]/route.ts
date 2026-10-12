import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { inviteEmail, inviteLink, newInviteToken, sendInviteEmail, hashInviteToken } from "@/lib/support-team-invite"

// DELETE /api/team/[id] -- owner revokes an invite / removes a member, or a
// member leaves. RLS (support_team_delete) decides which rows the caller may delete.
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

// POST /api/team/[id]                      -- accept (invitee, from the dashboard)
// POST /api/team/[id]  { action: "resend" } -- owner re-sends with a fresh link
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))

  if (body.action === "resend") {
    const { data: invite } = await supabase
      .from("support_team_members")
      .select("id, learner_name, invited_email, role")
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .eq("status", "pending")
      .maybeSingle()
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 })

    const { token, hash, expiresAt } = newInviteToken()
    const { error } = await supabase.rpc("refresh_support_team_invite", {
      invite_id: invite.id,
      new_token_hash: hash,
      expires_at: expiresAt,
    })
    if (error) return dbErrorResponse(error)

    const link = inviteLink(process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin, invite.id, token)
    const { data: profile } = await supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle()
    const inviterName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user.email || "Someone"
    const emailSent = await sendInviteEmail(
      invite.invited_email,
      inviteEmail({ learnerName: invite.learner_name, role: invite.role, inviterName, link }),
    )
    return NextResponse.json({ ok: true, emailSent, link: emailSent ? undefined : link })
  }

  const { data, error } = await supabase.rpc("accept_support_team_invite", {
    invite_id: params.id,
    token_hash: typeof body.token === "string" ? hashInviteToken(body.token) : null,
  })
  if (error) return dbErrorResponse(error, 404)

  return NextResponse.json({ ok: true, learner_id: data })
}
