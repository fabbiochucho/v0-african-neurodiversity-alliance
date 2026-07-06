import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isFederationEnabled } from "@/lib/federation/config"
import { verifySiblingLinkToken } from "@/lib/federation/jwt"

const CONSENT_VERSION = "1.0"

// Called from app/connect/page.tsx once the user accepts the consent screen.
// Verifies the link token Neu Rafiki issued, then creates (or re-activates)
// the linked_accounts row for the current Alliance user.
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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { token } = await request.json()
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    let payload
    try {
      payload = await verifySiblingLinkToken(token)
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired link token" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("linked_accounts")
      .upsert(
        {
          local_user_id: user.id,
          remote_app: "neurafiki",
          remote_user_id: payload.sub,
          remote_email: payload.email,
          status: "active",
          scopes: payload.scopes,
          consent_version: CONSENT_VERSION,
          revoked_at: null,
        },
        { onConflict: "local_user_id,remote_app,remote_user_id" },
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
