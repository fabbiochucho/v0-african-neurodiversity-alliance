import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

type Service = ReturnType<typeof createServiceClient>

async function listAll(service: Service, bucket: string, prefix: string): Promise<string[]> {
  const { data } = await service.storage.from(bucket).list(prefix, { limit: 1000 })
  const out: string[] = []
  for (const item of data ?? []) {
    const path = `${prefix}/${item.name}`
    // Folders come back without an id.
    if (item.id) out.push(path)
    else out.push(...(await listAll(service, bucket, path)))
  }
  return out
}

// POST /api/account/delete { email } -- permanently deletes the caller's
// account. The typed email must match. Uses the service role, so every
// step is explicit and scoped to this user's id.
//
// Kept: payment records. subscriptions.user_id is set to null by the
// foreign key from scripts/043, so payment_transactions stay for
// financial record-keeping without pointing at a person.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (typeof body.email !== "string" || body.email.trim().toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({ error: "The email you typed doesn't match your account." }, { status: 400 })
  }

  let service: Service
  try {
    service = createServiceClient()
  } catch {
    return NextResponse.json({ error: "Account deletion isn't available right now. Nothing was deleted." }, { status: 503 })
  }

  const uid = user.id
  try {
    // 1. Files in Storage (not covered by database cascades).
    for (const bucket of ["learner-files", "branding"]) {
      const paths = await listAll(service, bucket, uid).catch(() => [])
      if (paths.length > 0) await service.storage.from(bucket).remove(paths)
    }

    // 2. Learners and everything under them (IEPs, goals, check-ins,
    //    reports, snapshots, records, screenings, consents, team rows all
    //    cascade from learner_profiles).
    const { error: learnersError } = await service.from("learner_profiles").delete().eq("user_id", uid)
    if (learnersError) throw learnersError

    // 3. Teams this user is a member of, and any consents/usage rows.
    await service.from("support_team_members").delete().eq("member_user_id", uid)
    await service.from("ai_learner_consent_events").delete().eq("user_id", uid)
    await service.from("ai_companion_usage").delete().eq("user_id", uid)

    // 4. The login itself. profiles and everything referencing it cascade;
    //    subscriptions keep their rows with user_id set to null.
    const { error: authError } = await service.auth.admin.deleteUser(uid)
    if (authError) throw authError
  } catch {
    console.error("account deletion failed part-way")
    return NextResponse.json(
      { error: "Something went wrong while deleting. Some data may already be removed; please try again or contact us." },
      { status: 500 },
    )
  }

  await supabase.auth.signOut().catch(() => {})
  return NextResponse.json({ ok: true })
}
