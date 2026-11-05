// Permanently deletes one account and everything in it. Used by self-service deletion
// (app/api/account/delete) and by the 30-day purge of accounts staff soft-deleted.
// Kept: payment records (subscriptions.user_id becomes null; see scripts/043).
import type { createServiceClient } from "@/lib/supabase/service"

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

export async function deleteAccountData(service: Service, uid: string): Promise<void> {
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
}
