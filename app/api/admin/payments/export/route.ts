import { NextResponse } from "next/server"
import { staffForApi } from "@/lib/admin"
import { can } from "@/lib/admin/permissions"
import { logAdminAction } from "@/lib/admin/audit"
import { toCsv } from "@/lib/admin/pii"
import { createServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

const STATUSES = ["failed", "pending", "successful", "refunded"]

// CSV of payments with one status. Donor emails are included only for staff who may see PII.
export async function GET(request: Request) {
  const staff = await staffForApi("exports.run")
  if (staff instanceof NextResponse) return staff
  if (!can(staff.role, "billing.read")) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const status = new URL(request.url).searchParams.get("status") ?? "successful"
  if (!STATUSES.includes(status)) return NextResponse.json({ error: "Unknown status." }, { status: 400 })
  const pii = can(staff.role, "users.reveal_pii")

  const rows: Record<string, unknown>[] = []
  for (let from = 0; rows.length < 20_000; from += 1000) {
    let q = createServiceClient()
      .from("payment_transactions")
      .select("id, created_at, amount, currency, status, provider, purpose, donor_email, refunded_at, refund_amount, refund_reference, subscriptions(user_id, tier)")
      .order("created_at", { ascending: false })
      .range(from, from + 999)
    q = status === "refunded" ? q.not("refunded_at", "is", null) : q.eq("status", status)
    const { data, error } = await q
    if (error) return NextResponse.json({ error: "Couldn't load payments." }, { status: 500 })
    for (const t of data ?? []) {
      const sub = (Array.isArray(t.subscriptions) ? t.subscriptions[0] : t.subscriptions) as { user_id: string | null; tier: string } | null
      rows.push({ ...t, subscriptions: undefined, user_id: sub?.user_id ?? "", tier: sub?.tier ?? "", donor_email: pii ? t.donor_email : "" })
    }
    if (!data || data.length < 1000) break
  }
  await logAdminAction(staff, "billing.export", { type: "payment_transactions", after: { status, rows: rows.length, pii } })
  const cols = ["id", "created_at", "amount", "currency", "status", "provider", "purpose", "tier", "user_id", "donor_email", "refunded_at", "refund_amount", "refund_reference"]
  return new NextResponse(toCsv(cols, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="anda-payments-${status}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
