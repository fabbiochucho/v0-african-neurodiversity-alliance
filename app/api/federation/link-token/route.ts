import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isFederationEnabled, THIS_APP_ID } from "@/lib/federation/config"
import { signLinkToken } from "@/lib/federation/jwt"

// Mints a short-lived link token proving who the current user is, for the
// "Connect account" handshake. The browser is expected to redirect to
// `${siblingAppUrl}/connect?token=...` with the returned token.
export async function POST(request: Request) {
  if (!isFederationEnabled()) {
    return NextResponse.json(
      { error: "Cross-app account linking is not enabled on this deployment" },
      { status: 503 },
    )
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const requestedScopes = Array.isArray(body?.scopes) ? body.scopes.filter((s: unknown) => typeof s === "string") : []
    const scopes = requestedScopes.length > 0 ? requestedScopes : ["assessment_sync"]

    const token = await signLinkToken({
      iss: THIS_APP_ID,
      sub: user.id,
      email: user.email,
      scopes,
    })

    return NextResponse.json({ token })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 })
  }
}
