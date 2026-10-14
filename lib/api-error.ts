import { NextResponse } from "next/server"
import type { SubscriptionTier } from "@/lib/types/iep"

// Supabase/Postgres error.message can include table/column/constraint names
// (e.g. "duplicate key value violates unique constraint \"ieps_pkey\""),
// which is fine to log server-side but shouldn't reach the client. Route
// handlers should log the real error and respond with this instead of
// forwarding error.message directly.
export function dbErrorResponse(error: { message: string }, status = 400) {
  console.error(error)
  return NextResponse.json({ error: "Something didn't save. Your information is still here. Try again." }, { status })
}

// 402 returned when a feature needs a higher tier (see lib/entitlements.ts).
// The UI keys off code === "upgrade_required" to show an upgrade prompt.
export function upgradeRequiredResponse(message: string, requiredTier: SubscriptionTier) {
  return NextResponse.json({ error: message, code: "upgrade_required", required_tier: requiredTier }, { status: 402 })
}
