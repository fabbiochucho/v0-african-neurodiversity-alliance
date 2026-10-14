import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchNeuRafikiAssessments } from "@/lib/federation/remote"

// Pulls the current user's completed assessment results from Neu Rafiki, on
// behalf of an active linked_accounts row with the assessment_sync scope.
// Used by the optional "Import from Neu Rafiki assessment" step in the IEP
// wizard and by screening. Any failure is returned as a normal JSON error
// so callers degrade gracefully instead of surfacing a broken feature.
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const result = await fetchNeuRafikiAssessments(supabase, user.id)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json(result.data)
}
