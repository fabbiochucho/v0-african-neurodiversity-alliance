import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { CSV_TEMPLATE, validateBulk } from "@/lib/bulk-enrollment"

// GET /api/learners/bulk -- the CSV template.
export async function GET() {
  return new NextResponse(CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="anda-learners-template.csv"',
    },
  })
}

// POST /api/learners/bulk { csv: string, dry_run?: boolean }
// Validates row by row and returns an error report; when not a dry run,
// inserts the valid rows. The learner cap is applied here and again by
// the database trigger from scripts/032.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const entitlement = await getEntitlement(supabase, user.id)
  if (!entitlement.can("bulk_enrollment")) {
    return upgradeRequiredResponse("Bulk enrollment is part of the Institutional plan.", FEATURE_MIN_TIER.bulk_enrollment)
  }

  const body = await request.json().catch(() => ({}))
  if (typeof body.csv !== "string" || body.csv.length > 1_000_000) {
    return NextResponse.json({ error: "Upload a CSV file under 1 MB." }, { status: 400 })
  }

  const { count, error: countError } = await supabase
    .from("learner_profiles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
  if (countError) return dbErrorResponse(countError)

  const report = validateBulk(body.csv, Math.max(0, entitlement.learnerLimit - (count ?? 0)))

  if (body.dry_run || report.valid.length === 0) {
    return NextResponse.json({ ...report, inserted: 0 })
  }

  const { error } = await supabase
    .from("learner_profiles")
    .insert(report.valid.map(({ learner }) => ({ ...learner, user_id: user.id })))
  if (error) return dbErrorResponse(error)

  return NextResponse.json({ ...report, inserted: report.valid.length })
}
