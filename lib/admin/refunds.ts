// Full or partial refunds of a successful payment, through the provider that took it.
// Recorded on the transaction (scripts/060) and in the audit log. Server-only.
import { createServiceClient } from "@/lib/supabase/service"
import type { Staff } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import type { ActionResult } from "@/lib/admin/user-actions"

interface Tx {
  id: string
  amount: number | null
  currency: string | null
  status: string | null
  provider: string | null
  flutterwave_transaction_id: string | null
  paystack_reference: string | null
  transaction_id: string | null
  refunded_at: string | null
}

/** Amount in currency units; null means refund the whole payment. Rejects anything above the payment. */
export function refundAmount(tx: Pick<Tx, "amount">, requested: string): number | null | "invalid" {
  const trimmed = requested.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n <= 0 || tx.amount == null || n > Number(tx.amount)) return "invalid"
  return Math.round(n * 100) / 100
}

async function callProvider(tx: Tx, amount: number | null): Promise<{ ok: true; reference: string } | { ok: false; message: string }> {
  if ((tx.provider ?? "flutterwave") === "paystack") {
    const key = process.env.PAYSTACK_SECRET_KEY
    if (!key || !tx.paystack_reference) return { ok: false, message: "No Paystack key or reference for this payment." }
    const res = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      // Paystack takes the amount in the currency's subunit (kobo, pesewas, cents).
      body: JSON.stringify({ transaction: tx.paystack_reference, ...(amount != null && { amount: Math.round(amount * 100) }) }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok || body.status !== true) return { ok: false, message: body.message ?? `Paystack refused the refund (${res.status}).` }
    return { ok: true, reference: String(body.data?.id ?? body.data?.transaction?.reference ?? "paystack") }
  }
  const key = process.env.FLUTTERWAVE_SECRET_KEY
  if (!key || !tx.flutterwave_transaction_id) return { ok: false, message: "No Flutterwave key or transaction ID for this payment." }
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(tx.flutterwave_transaction_id)}/refund`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(amount != null ? { amount } : {}),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.status !== "success") return { ok: false, message: body.message ?? `Flutterwave refused the refund (${res.status}).` }
  return { ok: true, reference: String(body.data?.id ?? "flutterwave") }
}

export async function refundPayment(staff: Staff, txId: string, requested: string, confirm: string): Promise<ActionResult> {
  if (confirm !== "REFUND") return { ok: false, message: "Type REFUND to confirm." }
  const db = createServiceClient()
  const { data: tx } = await db
    .from("payment_transactions")
    .select("id, amount, currency, status, provider, flutterwave_transaction_id, paystack_reference, transaction_id, refunded_at")
    .eq("id", txId)
    .maybeSingle<Tx>()
  if (!tx) return { ok: false, message: "Payment not found." }
  if (tx.status !== "successful") return { ok: false, message: "Only successful payments can be refunded." }
  if (tx.refunded_at) return { ok: false, message: "This payment has already been refunded." }
  const amount = refundAmount(tx, requested)
  if (amount === "invalid") return { ok: false, message: `Enter an amount up to ${tx.amount} ${tx.currency ?? ""}, or leave it empty for a full refund.` }

  const result = await callProvider(tx, amount)
  if (!result.ok) return result
  const refunded = amount ?? Number(tx.amount)
  const { error } = await db
    .from("payment_transactions")
    .update({ refunded_at: new Date().toISOString(), refund_amount: refunded, refund_reference: result.reference, refunded_by: staff.email })
    .eq("id", tx.id)
  if (error) console.error("Refund sent but not recorded:", tx.id, error)
  await logAdminAction(staff, "billing.refund", {
    type: "payment_transaction",
    id: tx.id,
    before: { status: tx.status, amount: tx.amount, currency: tx.currency },
    after: { refund_amount: refunded, partial: amount != null && amount < Number(tx.amount), provider: tx.provider, reference: result.reference },
  })
  return { ok: true, message: `Refund of ${refunded} ${tx.currency ?? ""} requested from ${tx.provider ?? "flutterwave"}.` }
}
