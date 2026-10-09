import { createServiceClient } from "@/lib/supabase/service"
import { dbErrorResponse } from "@/lib/api-error"
import { initializePaystackPayment } from "@/lib/payments/paystack"
import { NextResponse } from "next/server"

// POST /api/payments/paystack/donate
// Anonymous, one-off donation checkout — intentionally does NOT require
// authentication. Reuses payment_transactions with purpose = "donation",
// same as the Flutterwave donate route.
export async function POST(request: Request) {
  try {
    const { amount, currency = "USD", donorName, donorEmail, tierName } = await request.json()

    const parsedAmount = Number(amount)

    if (!parsedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "A valid donation amount is required" }, { status: 400 })
    }

    const transactionRef = `ANDA-PSTK-DON-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

    const service = createServiceClient()

    const { error: txError } = await service.from("payment_transactions").insert({
      subscription_id: null,
      transaction_id: transactionRef,
      amount: parsedAmount,
      currency,
      status: "pending",
      purpose: "donation",
      donor_name: donorName || null,
      donor_email: donorEmail || null,
      provider: "paystack",
    })

    if (txError) {
      return dbErrorResponse(txError)
    }

    const result = await initializePaystackPayment({
      reference: transactionRef,
      amount: parsedAmount,
      currency,
      email: donorEmail || "donor@anda.example.com",
      callback_url: `${appUrl}/api/payments/paystack/verify`,
      metadata: { purpose: "donation", donor_name: donorName, tier_name: tierName },
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    return NextResponse.json({ transactionRef, paymentLink: result.link }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
