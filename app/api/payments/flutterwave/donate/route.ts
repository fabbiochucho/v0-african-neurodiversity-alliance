import { createServiceClient } from "@/lib/supabase/service"
import { dbErrorResponse } from "@/lib/api-error"
import { initializeFlutterwavePayment } from "@/lib/payments/flutterwave"
import { NextResponse } from "next/server"

// POST /api/payments/flutterwave/donate
// Anonymous, one-off donation checkout — intentionally does NOT require
// authentication. Reuses payment_transactions with purpose = "donation"
// instead of a dedicated donations table.
export async function POST(request: Request) {
  try {
    const { amount, currency = "USD", donorName, donorEmail, tierName } = await request.json()

    const parsedAmount = Number(amount)

    if (!parsedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "A valid donation amount is required" }, { status: 400 })
    }

    const transactionRef = `ANDA-DON-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
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
    })

    if (txError) {
      return dbErrorResponse(txError)
    }

    const result = await initializeFlutterwavePayment({
      tx_ref: transactionRef,
      amount: parsedAmount,
      currency,
      payment_options: "card,mobilemoney,ussd",
      redirect_url: `${appUrl}/api/payments/flutterwave/verify`,
      meta: { purpose: "donation" },
      customer: {
        email: donorEmail || "donor@anda.example.com",
        name: donorName || "ANDA Supporter",
      },
      customizations: {
        title: tierName ? `ANDA Donation - ${tierName}` : "ANDA Donation",
        description: "One-time donation to the African Neurodiversity Alliance",
      },
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
