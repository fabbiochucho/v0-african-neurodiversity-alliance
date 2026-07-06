import { createServiceClient } from "@/lib/supabase/service"
import { transactionMatchesRecord } from "@/lib/payments/flutterwave"
import { NextResponse } from "next/server"

// POST /api/payments/flutterwave/webhook
//
// Independent server-to-server confirmation path, separate from the
// browser-redirect /verify route. Flutterwave signs webhook requests with a
// `verif-hash` header that must equal FLUTTERWAVE_SECRET_HASH — this is not
// a client-supplied hint, it's a shared secret only Flutterwave and this
// server know, so a valid hash is proof the request really came from
// Flutterwave.
export async function POST(request: Request) {
  try {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH
    const signature = request.headers.get("verif-hash")

    if (!secretHash || !signature || signature !== secretHash) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const body = await request.json()
    const data = body?.data

    if (!data?.tx_ref || !data?.id) {
      return NextResponse.json({ error: "Malformed webhook payload" }, { status: 400 })
    }

    const service = createServiceClient()

    const { data: recordedTx } = await service
      .from("payment_transactions")
      .select("*")
      .eq("transaction_id", data.tx_ref)
      .maybeSingle()

    if (!recordedTx) {
      // Nothing to reconcile against - acknowledge so Flutterwave stops retrying,
      // but don't mark anything as paid.
      return NextResponse.json({ received: true, matched: false })
    }

    const isMatch = transactionMatchesRecord(
      { status: data.status, txRef: data.tx_ref, amount: data.amount, currency: data.currency },
      { tx_ref: recordedTx.transaction_id, amount: recordedTx.amount, currency: recordedTx.currency },
    )

    if (!isMatch || data.status !== "successful") {
      await service
        .from("payment_transactions")
        .update({ status: "failed", flutterwave_transaction_id: String(data.id) })
        .eq("id", recordedTx.id)

      return NextResponse.json({ received: true, matched: false })
    }

    await service
      .from("payment_transactions")
      .update({ status: "successful", flutterwave_transaction_id: String(data.id) })
      .eq("id", recordedTx.id)

    if (recordedTx.purpose === "subscription" && recordedTx.subscription_id) {
      await service
        .from("subscriptions")
        .update({
          status: "active",
          flutterwave_ref: String(data.id),
          amount_paid: recordedTx.amount,
          payment_date: new Date().toISOString(),
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", recordedTx.subscription_id)
    }

    return NextResponse.json({ received: true, matched: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
