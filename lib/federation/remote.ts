// Server-side calls to Neu Rafiki under the round-3 contract.
import { unstable_cache } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getSiblingAppUrl, isFederationEnabled } from "@/lib/federation/config"
import { signRequestToken } from "@/lib/federation/jwt"
import { parseNeuRafikiEntitlements, type NeuRafikiEntitlements } from "@/lib/federation/contract"

export type NeuRafikiPlanState =
  | { state: "disabled" }
  | { state: "not_linked" }
  | { state: "unavailable" }
  | { state: "linked"; remoteEmail: string | null; plan: NeuRafikiEntitlements }

/** The caller's active Neu Rafiki link (RLS: their own rows only). */
export async function getActiveLink(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("linked_accounts")
    .select("id, remote_user_id, remote_email, scopes")
    .eq("local_user_id", userId)
    .eq("remote_app", "neurafiki")
    .eq("status", "active")
    .maybeSingle()
  return data
}

// Cached 5 minutes per linked pair, as the contract asks. A fresh signed
// token is minted inside, so the cache key never includes a token.
const fetchEntitlementsCached = unstable_cache(
  async (localUserId: string, remoteUserId: string): Promise<NeuRafikiEntitlements | "not_linked" | null> => {
    const base = getSiblingAppUrl()
    if (!base) return null
    const token = await signRequestToken({
      iss: "alliance",
      requesting_user_id: localUserId,
      target_remote_user_id: remoteUserId,
      scope: "entitlements",
    })
    const res = await fetch(new URL("/api/federation/entitlements", base), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (res.status === 404) return "not_linked"
    if (!res.ok) return null
    return parseNeuRafikiEntitlements(await res.json())
  },
  ["neurafiki-entitlements"],
  { revalidate: 300 },
)

export async function getNeuRafikiPlan(supabase: SupabaseClient, userId: string): Promise<NeuRafikiPlanState> {
  if (!isFederationEnabled()) return { state: "disabled" }
  const link = await getActiveLink(supabase, userId)
  if (!link) return { state: "not_linked" }
  try {
    const result = await fetchEntitlementsCached(userId, link.remote_user_id)
    if (result === "not_linked") return { state: "not_linked" }
    if (!result) return { state: "unavailable" }
    return { state: "linked", remoteEmail: link.remote_email, plan: result }
  } catch {
    return { state: "unavailable" }
  }
}
