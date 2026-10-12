import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { isSupportRole, normaliseInviteEmail } from "@/lib/support-team"
import { inviteEmail, inviteLink, newInviteToken, sendInviteEmail } from "@/lib/support-team-invite"

// POST /api/team { learner_id, email, role } -- the learner's owner invites
// someone to their support team and (if Resend is configured) emails them
// an expiring accept link. RLS (scripts/031 + 034) also requires the caller
// to own the learner, be on Pro+, and create the row as 'pending'.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!(await getEntitlement(supabase, user.id)).can("support_team")) {
    return upgradeRequiredResponse("Support teams are part of the Pro plan.", FEATURE_MIN_TIER.support_team)
  }

  const body = await request.json().catch(() => ({}))
  const email = normaliseInviteEmail(body.email)
  if (!email || !isSupportRole(body.role) || typeof body.learner_id !== "string") {
    return NextResponse.json({ error: "Enter a valid email and role." }, { status: 400 })
  }
  if (email === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "You can't invite yourself." }, { status: 400 })
  }

  const [{ data: learner }, { data: profile }] = await Promise.all([
    supabase.from("learner_profiles").select("id, name").eq("id", body.learner_id).eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle(),
  ])
  if (!learner) return NextResponse.json({ error: "Learner not found" }, { status: 404 })

  const { token, hash, expiresAt } = newInviteToken()
  const { data, error } = await supabase
    .from("support_team_members")
    .insert({
      learner_id: learner.id,
      learner_name: learner.name,
      owner_id: user.id,
      invited_email: email,
      role: body.role,
      invite_token_hash: hash,
      invite_expires_at: expiresAt,
    })
    .select("id, learner_id, learner_name, invited_email, role, status, member_user_id, invite_expires_at")
    .single()

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That person is already invited." }, { status: 409 })
    return dbErrorResponse(error)
  }

  const link = inviteLink(process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin, data.id, token)
  const inviterName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user.email || "Someone"
  const emailSent = await sendInviteEmail(email, inviteEmail({ learnerName: learner.name, role: body.role, inviterName, link }))

  // Without email, hand the link back once so the owner can share it
  // themselves (it's never stored in plain text).
  return NextResponse.json({ ...data, emailSent, link: emailSent ? undefined : link }, { status: 201 })
}
