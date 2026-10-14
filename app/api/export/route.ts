import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { EXPORT_COLUMNS, EXPORT_TABLES, toCsv, type ExportTable } from "@/lib/data-export"
import { logAudit } from "@/lib/audit"

// GET /api/export?format=json            -- everything, one JSON file
// GET /api/export?format=csv&table=goals -- one table as CSV
//
// Owner only: everything is read through the caller's own RLS-scoped client
// and filtered to learners whose user_id is the caller, so learners shared
// with them through a support team are NOT included.
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  if (!(await getEntitlement(supabase, user.id)).can("data_export")) {
    return upgradeRequiredResponse("Data export is part of the Institutional plan.", FEATURE_MIN_TIER.data_export)
  }

  const url = new URL(request.url)
  const format = url.searchParams.get("format") === "csv" ? "csv" : "json"
  const table = url.searchParams.get("table") as ExportTable | null
  if (format === "csv" && (!table || !EXPORT_TABLES.includes(table))) {
    return NextResponse.json({ error: `table must be one of ${EXPORT_TABLES.join(", ")}` }, { status: 400 })
  }

  const { data: learners, error } = await supabase
    .from("learner_profiles")
    .select("id, name, age, gender, country, diagnosis_domains, created_at")
    .eq("user_id", user.id)
  if (error) return dbErrorResponse(error)
  const learnerIds = (learners ?? []).map((l) => l.id)

  const [{ data: ieps }, { data: reports }] = await Promise.all([
    learnerIds.length
      ? supabase
          .from("ieps")
          .select(
            "id, learner_id, iep_goals(id, goal_text, domain, status, baseline, target, measurement, target_completion_date, created_at, progress_logs(id, rating, notes, logged_date, logged_by, created_at))",
          )
          .in("learner_id", learnerIds)
      : Promise.resolve({ data: [] as never[] }),
    learnerIds.length
      ? supabase.from("reports").select("id, learner_id, report_type, report_period, content, email_sent, created_at").in("learner_id", learnerIds)
      : Promise.resolve({ data: [] as never[] }),
  ])

  type Goal = { id: string; progress_logs?: Record<string, unknown>[] } & Record<string, unknown>
  const goals = (ieps ?? []).flatMap((iep: { id: string; learner_id: string; iep_goals?: Goal[] }) =>
    (iep.iep_goals ?? []).map((g) => ({ ...g, iep_id: iep.id, learner_id: iep.learner_id })),
  )
  const progress = goals.flatMap((g) => (g.progress_logs ?? []).map((l) => ({ ...l, goal_id: g.id, learner_id: g.learner_id })))
  const data: Record<ExportTable, Record<string, unknown>[]> = {
    learners: learners ?? [],
    goals: goals.map(({ progress_logs: _logs, ...g }) => g),
    progress,
    reports: reports ?? [],
  }

  await logAudit({ actorId: user.id, ownerId: user.id, action: "export", resource: format === "csv" ? `export ${table} (CSV)` : "export everything (JSON)" })
  const stamp = new Date().toISOString().slice(0, 10)
  if (format === "csv" && table) {
    return new NextResponse(toCsv(data[table], EXPORT_COLUMNS[table]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="anda-${table}-${stamp}.csv"`,
      },
    })
  }

  return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), ...data }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="anda-export-${stamp}.json"`,
    },
  })
}
