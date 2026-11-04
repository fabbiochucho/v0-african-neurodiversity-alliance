import { NextResponse } from "next/server"
import { staffForApi } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import { createServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v)
  // Quote everything; neutralise spreadsheet formulas.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`
}

// Every subscription with its consent record, including unsubscribed ones (needed to prove consent).
export async function GET() {
  const staff = await staffForApi("newsletter.export")
  if (staff instanceof NextResponse) return staff
  const rows: Record<string, unknown>[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await createServiceClient()
      .from("newsletter_subscribers")
      .select("email, first_name, consent_source, consented_at, consent_text, unsubscribed_at")
      .order("created_at")
      .range(from, from + 999)
    if (error) return NextResponse.json({ error: "Couldn't load subscribers." }, { status: 500 })
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  await logAdminAction(staff, "newsletter.export", { type: "newsletter_subscribers", after: { rows: rows.length } })
  const cols = ["email", "first_name", "consent_source", "consented_at", "consent_text", "unsubscribed_at"]
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\r\n")
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="anda-newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
