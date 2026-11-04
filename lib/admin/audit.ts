// Append-only log of admin actions (scripts/059): who, what, which record, before and after,
// IP and browser. Call it after the change succeeds.
import { headers } from "next/headers"
import { createServiceClient } from "@/lib/supabase/service"
import type { Staff } from "@/lib/admin"

export async function logAdminAction(
  staff: { userId: Staff["userId"] | null; email: string }, // email "system:<job>" for scheduled jobs
  action: string,
  target: { type?: string; id?: string | null; before?: unknown; after?: unknown } = {},
): Promise<void> {
  const h = await headers()
  const { error } = await createServiceClient()
    .from("admin_audit_log")
    .insert({
      actor_id: staff.userId || null,
      actor_email: staff.email,
      action,
      target_type: target.type ?? null,
      target_id: target.id ?? null,
      before: target.before ?? null,
      after: target.after ?? null,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null,
      user_agent: h.get("user-agent")?.slice(0, 500) ?? null,
    })
  if (error) console.error("Admin audit log write failed:", action, error)
}
