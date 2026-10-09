import { createServiceClient } from "@/lib/supabase/service"
import {
  computePaystackSignature,
  finalizeSuccessfulPaystackPayment,
  signatureMatches,
  transactionMatchesRecord,
} from "@/lib/payments/paystack"
import { NextResponse } from "next/server"

// POST /api/payments/paystack/webhook
//
// Independent server-to-server confirmation path, separate from the
// browser-redirect /verify route. Paystack signs webhook requests with an
// `x-paystack-signature` header: HMAC-SHA512 of the raw request body using
// PAYSTACK_SECRET_KEY. Must be computed over the exact raw bytes Paystack
// sent -- request.json() would re-serialize and break the signature, so the
// raw text is read first and parsed only after the signature checks out.
export async function POST(request: Request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const signature = request.headers.get("x-paystack-signature")
    const rawBody = await request.text()

    if (!secretKey || !signature || !signatureMatches(signature, computePaystackSignature(rawBody, secretKey))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const data = body?.data

    if (!data?.reference || body?.event !== "charge.success") {
      return NextResponse.json({ received: true, matched: false })
    }

    const service = createServiceClient()

    const { data: recordedTx } = await service
      .from("payment_transactions")
      .select("*")
      .eq("transaction_id", data.reference)
      .maybeSingle()

    if (!recordedTx) {
      return NextResponse.json({ received: true, matched: false })
    }

    const isMatch = transactionMatchesRecord(
      {
        status: data.status,
        txRef: data.reference,
        amount: typeof data.amount === "number" ? data.amount / 100 : undefined,
        currency: data.currency,
      },
      { tx_ref: recordedTx.transaction_id, amount: recordedTx.amount, currency: recordedTx.currency },
    )

    if (!isMatch || data.status !== "success") {
      await service
        .from("payment_transactions")
        .update({ status: "failed", provider: "paystack", paystack_reference: String(data.reference) })
        .eq("id", recordedTx.id)

      return NextResponse.json({ received: true, matched: false })
    }

    await finalizeSuccessfulPaystackPayment(service, recordedTx, String(data.reference))

    return NextResponse.json({ received: true, matched: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
