import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminPage } from "@/components/admin/admin-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createServiceClient } from "@/lib/supabase/service"
import { allowed, requireStaff, staffForAction } from "@/lib/admin"
import { maskEmail } from "@/lib/admin/pii"
import { refundPayment } from "@/lib/admin/refunds"

export const dynamic = "force-dynamic"
export const metadata = { title: "Payments | ANDA admin", robots: { index: false } }

const PAGE = 50
const STATUSES = ["failed", "pending", "successful", "refunded"] as const

async function refund(formData: FormData) {
  "use server"
  const staff = await staffForAction("billing.refund")
  if (!staff) return
  const r = await refundPayment(staff, String(formData.get("tx") ?? ""), String(formData.get("amount") ?? ""), String(formData.get("confirm") ?? ""))
  redirect(`/admin/payments?status=successful&msg=${encodeURIComponent(r.message)}`)
}

// Plans are one-off payments that never renew, so there's no MRR, churn or dunning here:
// payments, failed attempts to follow up, and refunds.
export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string; msg?: string }> }) {
  const staff = await requireStaff("billing.read")
  const p = await searchParams
  const can = allowed(staff, ["billing.refund", "exports.run"])
  const status = STATUSES.includes(p.status as (typeof STATUSES)[number]) ? p.status! : "failed"
  const page = Math.max(0, Number(p.page) || 0)
  const db = createServiceClient()

  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()
  let q = db
    .from("payment_transactions")
    .select("id, amount, currency, status, provider, purpose, donor_email, created_at, refunded_at, refund_amount, subscriptions(user_id, tier)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * PAGE, page * PAGE + PAGE - 1)
  q = status === "refunded" ? q.not("refunded_at", "is", null) : q.eq("status", status)
  const [{ data: rows, count }, { data: last30 }] = await Promise.all([
    q,
    db.from("payment_transactions").select("amount, currency, status, refund_amount").gte("created_at", since30).limit(5000),
  ])

  const totals = new Map<string, { paid: number; refunded: number; failed: number }>()
  for (const t of last30 ?? []) {
    const c = t.currency ?? "?"
    const row = totals.get(c) ?? { paid: 0, refunded: 0, failed: 0 }
    if (t.status === "successful") row.paid += Number(t.amount ?? 0)
    if (t.status === "failed") row.failed += 1
    row.refunded += Number(t.refund_amount ?? 0)
    totals.set(c, row)
  }

  return (
    <AdminPage
      title="Payments"
      message={p.msg}
      intro={<p>Plan payments and donations. Plans are paid per period and never renew automatically.</p>}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Last 30 days</CardTitle>
          <CardDescription>By currency. Refunds are what staff requested from the provider.</CardDescription>
        </CardHeader>
        <CardContent>
          {!totals.size ? <p className="text-sm text-muted-foreground">No payments in the last 30 days.</p> : (
            <ul className="grid sm:grid-cols-3 gap-4 text-sm">
              {[...totals].map(([c, t]) => (
                <li key={c} className="rounded-lg border p-3">
                  <p className="font-medium">{c}</p>
                  <p>Paid {t.paid.toFixed(2)} · refunded {t.refunded.toFixed(2)} · {t.failed} failed</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <nav aria-label="Payment status" className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/payments?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm ${s === status ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
          >
            {s === "failed" ? "Failed (follow up)" : s[0].toUpperCase() + s.slice(1)}
          </Link>
        ))}
        {can.has("exports.run") && (
          <a href={`/api/admin/payments/export?status=${status}`} className="text-sm text-primary underline self-center ml-2">Export CSV (logged)</a>
        )}
      </nav>

      {!rows?.length ? (
        <p className="text-muted-foreground">No {status} payments.</p>
      ) : (
        <ul className="divide-y rounded-lg border text-sm">
          {rows.map((t) => {
            const sub = (Array.isArray(t.subscriptions) ? t.subscriptions[0] : t.subscriptions) as { user_id: string | null; tier: string } | null
            return (
              <li key={t.id} className="p-3 space-y-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <span>
                    {t.created_at.slice(0, 16).replace("T", " ")} · {t.purpose ?? (sub ? `${sub.tier} plan` : "payment")} · {t.provider ?? "flutterwave"}
                    {sub?.user_id ? (
                      <> · <Link href={`/admin/users/${sub.user_id}?tab=billing`} className="text-primary underline">account</Link></>
                    ) : t.donor_email ? (
                      <> · donor {maskEmail(t.donor_email)}</>
                    ) : null}
                  </span>
                  <span>{t.amount} {t.currency} · <strong>{t.refunded_at ? `refunded ${t.refund_amount}` : t.status}</strong></span>
                </div>
                {can.has("billing.refund") && t.status === "successful" && !t.refunded_at && (
                  <details>
                    <summary className="cursor-pointer text-primary">Refund</summary>
                    <form action={refund} className="mt-2 flex flex-wrap gap-2 items-end">
                      <input type="hidden" name="tx" value={t.id} />
                      <label htmlFor={`amt-${t.id}`} className="space-y-1"><span className="block">Amount (empty = full)</span>
                        <Input id={`amt-${t.id}`} name="amount" inputMode="decimal" className="w-32" />
                      </label>
                      <label htmlFor={`rc-${t.id}`} className="space-y-1"><span className="block">Type REFUND</span>
                        <Input id={`rc-${t.id}`} name="confirm" required autoComplete="off" className="w-32" />
                      </label>
                      <Button type="submit" size="sm" variant="destructive">Refund</Button>
                    </form>
                  </details>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <nav className="flex gap-4 text-sm" aria-label="Pages">
        {page > 0 && <Link href={`/admin/payments?status=${status}&page=${page - 1}`} className="text-primary underline">Newer</Link>}
        {(count ?? 0) > (page + 1) * PAGE && <Link href={`/admin/payments?status=${status}&page=${page + 1}`} className="text-primary underline">Older</Link>}
        <span className="text-muted-foreground">{count ?? 0} payments</span>
      </nav>
    </AdminPage>
  )
}

