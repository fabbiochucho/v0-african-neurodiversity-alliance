import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { inviteEmail, inviteLink, newInviteToken, sendInviteEmail, hashInviteToken } from "@/lib/support-team-invite"
import { roleLabel } from "@/lib/support-team"
import { isPreset, validatePermissions } from "@/lib/team-permissions"
import { logAudit } from "@/lib/audit"
import { appUrl } from "@/lib/app-url"

// PATCH /api/team/[id] { preset, permissions } -- the learner's owner changes
// a member's role preset and permissions (security-definer RPC; the DB
// trigger re-checks the under-18 rule).
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (!isPreset(body.preset)) return NextResponse.json({ error: "Choose a role." }, { status: 400 })

  const { data: member } = await supabase.from("support_team_members").select("learner_id").eq("id", params.id).maybeSingle()
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const { data: learner } = await supabase.from("learner_profiles").select("age, user_id").eq("id", member.learner_id).maybeSingle()
  if (!learner || learner.user_id !== user.id) return NextResponse.json({ error: "Only the learner's owner can change permissions." }, { status: 403 })

  const checked = validatePermissions(body.permissions, { learnerAge: learner.age, callerIsOwner: true })
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 })

  const { error } = await supabase.rpc("set_member_permissions", {
    member_id: params.id,
    new_role: body.preset,
    new_permissions: checked.permissions,
  })
  if (error) return dbErrorResponse(error)
  await logAudit({ actorId: user.id, ownerId: user.id, learnerId: member.learner_id, action: "change", resource: "team permissions changed" })
  return NextResponse.json({ ok: true, permissions: checked.permissions })
}

// DELETE /api/team/[id] -- owner revokes an invite / removes a member, or a
// member leaves. RLS (support_team_delete) decides which rows the caller may delete.
export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const { data, error } = await supabase.from("support_team_members").delete().eq("id", params.id).select("id")
  if (error) return dbErrorResponse(error)
  if (!data || data.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ ok: true })
}

// POST /api/team/[id]                      -- accept (invitee, from the dashboard)
// POST /api/team/[id]  { action: "resend" } -- owner re-sends with a fresh link
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

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

    const link = inviteLink(appUrl(new URL(request.url).origin), invite.id, token)
    const { data: profile } = await supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle()
    const inviterName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user.email || "Someone"
    const emailSent = await sendInviteEmail(
      invite.invited_email,
      inviteEmail({ learnerName: invite.learner_name, role: roleLabel(invite.role), inviterName, link }),
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
