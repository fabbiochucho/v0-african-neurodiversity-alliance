import { createServiceClient } from "@/lib/supabase/service"
import {
  finalizeSuccessfulPaystackPayment,
  toVerifiedTransaction,
  transactionMatchesRecord,
  verifyPaystackTransaction,
} from "@/lib/payments/paystack"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

// GET /api/payments/paystack/verify
//
// Paystack redirects the browser here with ?reference= after checkout. That
// query param is attacker-controllable (nothing stops a user hand-editing
// the URL), so it's only ever used as a hint for which transaction to look
// up. The actual pass/fail decision always comes from:
//   1. a server-to-server GET /transaction/verify/:reference call to Paystack, and
//   2. confirming the verified reference/amount/currency match the row we
//      wrote ourselves during /initialize or /donate (before the user ever
//      reached Paystack).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const referenceParam = searchParams.get("reference") || searchParams.get("trxref")

  if (!referenceParam) {
    redirect("/iep/settings/subscription?error=missing_transaction")
  }

  const verification = await verifyPaystackTransaction(referenceParam)

  if (!verification.ok) {
    redirect("/iep/settings/subscription?error=verification_failed")
  }

  const lookupRef = verification.reference || referenceParam

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

  const isMatch = transactionMatchesRecord(toVerifiedTransaction(verification), {
    tx_ref: recordedTx.transaction_id,
    amount: recordedTx.amount,
    currency: recordedTx.currency,
  })

  if (!isMatch || verification.status !== "success") {
    await service
      .from("payment_transactions")
      .update({ status: "failed", provider: "paystack", paystack_reference: lookupRef })
      .eq("id", recordedTx.id)

    redirect(`${redirectBase}?error=payment_verification_mismatch`)
  }

  await finalizeSuccessfulPaystackPayment(service, recordedTx, lookupRef)

  redirect(
    recordedTx.purpose === "subscription"
      ? "/iep/settings/subscription?success=payment_completed"
      : "/donate?success=thank_you",
  )
}
