import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { normaliseInviteEmail, roleLabel } from "@/lib/support-team"
import { isPreset, PRESET_PERMISSIONS, validatePermissions, type Preset } from "@/lib/team-permissions"
import { inviteEmail, inviteLink, newInviteToken, sendInviteEmail } from "@/lib/support-team-invite"
import { appUrl } from "@/lib/app-url"

// POST /api/team { learner_id, email, preset, permissions? } -- invite
// someone to a learner's support team with per-member permissions
// (brief §20). The learner's owner, or a member holding 'invite', may
// invite. RLS (scripts/044) re-checks: has_permission(learner, 'invite'),
// the owner's Pro plan, a fresh 'pending' row, and (trigger) that only the
// owner grants approve/manage/invite/export for under-18s.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const email = normaliseInviteEmail(body.email)
  if (!email || !isPreset(body.preset) || typeof body.learner_id !== "string") {
    return NextResponse.json({ error: "Enter a valid email and role." }, { status: 400 })
  }
  if (email === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "You can't invite yourself." }, { status: 400 })
  }

  const [{ data: learner }, { data: profile }, { data: canInvite }] = await Promise.all([
    supabase.from("learner_profiles").select("id, name, age, user_id").eq("id", body.learner_id).maybeSingle(),
    supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle(),
    supabase.rpc("has_permission", { p_learner_id: body.learner_id, p_perm: "invite" }),
  ])
  if (!learner) return NextResponse.json({ error: "Learner not found" }, { status: 404 })
  const isOwner = learner.user_id === user.id
  if (!isOwner && canInvite !== true) {
    return NextResponse.json({ error: "You don't have permission to invite people to this team." }, { status: 403 })
  }

  // Support teams follow the owner's plan.
  if (isOwner && !(await getEntitlement(supabase, user.id)).can("support_team")) {
    return upgradeRequiredResponse("Support teams are part of the Pro plan.", FEATURE_MIN_TIER.support_team)
  }

  const checked = validatePermissions(body.permissions ?? PRESET_PERMISSIONS[body.preset as Preset], {
    learnerAge: learner.age,
    callerIsOwner: isOwner,
  })
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 })

  const { token, hash, expiresAt } = newInviteToken()
  const { data, error } = await supabase
    .from("support_team_members")
    .insert({
      learner_id: learner.id,
      learner_name: learner.name,
      owner_id: learner.user_id,
      invited_email: email,
      role: body.preset,
      permissions: checked.permissions,
      invite_token_hash: hash,
      invite_expires_at: expiresAt,
    })
    .select("id, learner_id, learner_name, invited_email, role, permissions, status, member_user_id, invite_expires_at")
    .single()

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That person is already invited." }, { status: 409 })
    return dbErrorResponse(error)
  }

  const link = inviteLink(appUrl(new URL(request.url).origin), data.id, token)
  const inviterName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user.email || "Someone"
  const emailSent = await sendInviteEmail(
    email,
    inviteEmail({ learnerName: learner.name, role: roleLabel(body.preset), inviterName, link }),
  )

  // Without email, hand the link back once so it can be shared directly
  // (it's never stored in plain text).
  return NextResponse.json({ ...data, emailSent, link: emailSent ? undefined : link }, { status: 201 })
}
