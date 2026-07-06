import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isFederationEnabled, getSiblingAppUrl } from "@/lib/federation/config"
import { signRequestToken } from "@/lib/federation/jwt"

// Pulls the current user's completed assessment results from Neu Rafiki, on
// behalf of an active linked_accounts row with the assessment_sync scope.
// Used by the optional "Import from Neu Rafiki assessment" step in
// app/iep/generate/page.tsx. Any failure here (not linked, sibling
// unreachable, sibling error) is returned as a normal JSON error response so
// the caller can degrade gracefully instead of surfacing a broken feature.
export async function POST() {
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

    const { data: linkedAccount, error: linkError } = await supabase
      .from("linked_accounts")
      .select("*")
      .eq("local_user_id", user.id)
      .eq("remote_app", "neurafiki")
      .eq("status", "active")
      .contains("scopes", ["assessment_sync"])
      .maybeSingle()

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 400 })
    }

    if (!linkedAccount) {
      return NextResponse.json(
        { error: "No active Neu Rafiki connection with assessment_sync scope. Connect an account first." },
        { status: 404 },
      )
    }

    const siblingUrl = getSiblingAppUrl()
    if (!siblingUrl) {
      return NextResponse.json(
        { error: "Cross-app account linking is not enabled on this deployment" },
        { status: 503 },
      )
    }

    const token = await signRequestToken({
      iss: "alliance",
      requesting_user_id: user.id,
      target_remote_user_id: linkedAccount.remote_user_id,
      scope: "assessment_sync",
    })

    const res = await fetch(`${siblingUrl}/api/federation/assessment-results`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Neu Rafiki declined the request (status ${res.status})` },
        { status: 502 },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to reach Neu Rafiki" }, { status: 502 })
  }
}
