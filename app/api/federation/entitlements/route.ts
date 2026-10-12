import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { isFederationEnabled } from "@/lib/federation/config"
import { bearerToken, verifySiblingRequestToken } from "@/lib/federation/jwt"
import { andaEntitlementsPayload } from "@/lib/federation/contract"
import { getEntitlement } from "@/lib/entitlements"

// GET /api/federation/entitlements -- called by Neu Rafiki with a request
// token it signed (scope "entitlements_read"). Returns ANDA's plan for the
// linked user so Neu Rafiki can *show* it. It never grants anything there.
// 404 when the accounts aren't linked. Cacheable for 5 minutes.
export async function GET(request: Request) {
  if (!isFederationEnabled()) return NextResponse.json({ error: "Federation is not enabled" }, { status: 503 })

  const token = bearerToken(request)
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 })

  let claims
  try {
    claims = await verifySiblingRequestToken(token, "entitlements_read")
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  // Service role: the caller is Neu Rafiki, not a signed-in ANDA user. Only
  // reads the link and the plan for the user the signed token names.
  const service = createServiceClient()
  const { data: link } = await service
    .from("linked_accounts")
    .select("id")
    .eq("local_user_id", claims.target_remote_user_id)
    .eq("remote_app", "neurafiki")
    .eq("remote_user_id", claims.requesting_user_id)
    .eq("status", "active")
    .maybeSingle()
  if (!link) return NextResponse.json({ error: "Not linked" }, { status: 404 })

  const { tier } = await getEntitlement(service, claims.target_remote_user_id)
  return NextResponse.json(andaEntitlementsPayload(tier), { headers: { "Cache-Control": "private, max-age=300" } })
}
