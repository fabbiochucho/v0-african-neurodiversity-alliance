// Audit log (brief §42, scripts/043). Written only from server code with
// the service role; never blocks or fails the request it records.
import { createServiceClient } from "@/lib/supabase/service"

export type AuditAction = "view" | "export" | "change" | "delete"

export async function logAudit(entry: {
  actorId: string
  action: AuditAction
  resource: string
  learnerId?: string | null
  ownerId?: string | null
}): Promise<void> {
  try {
    const service = createServiceClient()
    let ownerId = entry.ownerId ?? null
    if (!ownerId && entry.learnerId) {
      const { data } = await service.from("learner_profiles").select("user_id").eq("id", entry.learnerId).maybeSingle()
      ownerId = data?.user_id ?? null
    }
    await service.from("audit_log").insert({
      actor_id: entry.actorId,
      owner_id: ownerId ?? entry.actorId,
      learner_id: entry.learnerId ?? null,
      action: entry.action,
      resource: entry.resource.slice(0, 200),
    })
  } catch {
    // Missing service key or table (migration not applied): skip quietly.
    console.error("audit log write skipped")
  }
}

/** Learner id that owns a goal (for progress/goal changes). */
export async function learnerIdForGoal(goalId: string): Promise<string | null> {
  try {
    const service = createServiceClient()
    const { data } = await service.from("iep_goals").select("ieps(learner_id)").eq("id", goalId).maybeSingle()
    const ieps = data?.ieps as { learner_id: string } | { learner_id: string }[] | null | undefined
    return (Array.isArray(ieps) ? ieps[0]?.learner_id : ieps?.learner_id) ?? null
  } catch {
    return null
  }
}
