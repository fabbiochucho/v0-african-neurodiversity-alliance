import { createServiceClient } from "@/lib/supabase/service"
import { transactionMatchesRecord, verifyFlutterwaveTransaction } from "@/lib/payments/flutterwave"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

// GET /api/payments/flutterwave/verify
//
// Flutterwave redirects the browser here with ?status=&tx_ref=&transaction_id=
// after checkout. Those query params are attacker-controllable (the browser
// is redirected, nothing stops a user from hand-editing the URL), so they are
// only ever used as hints for which transaction to look up. The actual
// pass/fail decision always comes from:
//   1. a server-to-server GET /v3/transactions/{id}/verify call to Flutterwave, and
//   2. confirming the verified tx_ref/amount/currency match the row we wrote
//      ourselves during /initialize or /donate (before the user ever reached
//      Flutterwave).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const transactionId = searchParams.get("transaction_id")
  const txRefParam = searchParams.get("tx_ref")

  if (!transactionId) {
    redirect("/iep/settings/subscription?error=missing_transaction")
  }

  const verification = await verifyFlutterwaveTransaction(transactionId)

  if (!verification.ok) {
    redirect("/iep/settings/subscription?error=verification_failed")
  }

  const lookupRef = verification.txRef || txRefParam

  if (!lookupRef) {
    redirect("/iep/settings/subscription?error=missing_reference")
  }

  const service = createServiceClient()

  const { data: recordedTx } = await service
    .from("payment_transactions")
    .select("*")
    .eq("transaction_id", lookupRef)
    .maybeSingle()

  if (!recordedTx) {
    redirect("/iep/settings/subscription?error=unknown_transaction")
  }

  const redirectBase = recordedTx.purpose === "donation" ? "/donate" : "/iep/settings/subscription"

  const isMatch = transactionMatchesRecord(verification, {
    tx_ref: recordedTx.transaction_id,
    amount: recordedTx.amount,
    currency: recordedTx.currency,
  })

  if (!isMatch || verification.status !== "successful") {
    await service
      .from("payment_transactions")
      .update({ status: "failed", flutterwave_transaction_id: transactionId })
      .eq("id", recordedTx.id)

    redirect(`${redirectBase}?error=payment_verification_mismatch`)
  }

  // Only mark paid once verified + matched.
  await service
    .from("payment_transactions")
    .update({ status: "successful", flutterwave_transaction_id: transactionId })
    .eq("id", recordedTx.id)

  if (recordedTx.purpose === "subscription" && recordedTx.subscription_id) {
    await service
      .from("subscriptions")
      .update({
        status: "active",
        flutterwave_ref: transactionId,
        amount_paid: recordedTx.amount,
        payment_date: new Date().toISOString(),
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", recordedTx.subscription_id)

    redirect("/iep/settings/subscription?success=payment_completed")
  }

  redirect("/donate?success=thank_you")
}
