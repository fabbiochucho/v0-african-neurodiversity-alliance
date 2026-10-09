import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { createServiceClient } from "@/lib/supabase/service"
import { initializePaystackPayment } from "@/lib/payments/paystack"
import { SUBSCRIPTION_TIERS } from "@/lib/constants/iep"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tier } = await request.json()

    const plan = tier && Object.prototype.hasOwnProperty.call(SUBSCRIPTION_TIERS, tier)
      ? SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]
      : null

    if (!plan || !plan.price) {
      return NextResponse.json({ error: "Invalid subscription tier" }, { status: 400 })
    }

    const amount = plan.price
    const currency = "USD"

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", user.id)
      .single()

    const transactionRef = `ANDA-PSTK-SUB-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({ user_id: user.id, tier, status: "pending" })
      .select()
      .single()

    if (subError) {
      return dbErrorResponse(subError)
    }

    const service = createServiceClient()

    const { error: txError } = await service.from("payment_transactions").insert({
      subscription_id: subscription.id,
      transaction_id: transactionRef,
      amount,
      currency,
      status: "pending",
      purpose: "subscription",
      provider: "paystack",
    })

    if (txError) {
      return dbErrorResponse(txError)
    }

    const result = await initializePaystackPayment({
      reference: transactionRef,
      amount,
      currency,
      email: profile?.email || user.email || "",
      callback_url: `${appUrl}/api/payments/paystack/verify`,
      metadata: {
        consumer_id: user.id,
        subscription_id: subscription.id,
        purpose: "subscription",
      },
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    return NextResponse.json(
      { transactionRef, subscriptionId: subscription.id, paymentLink: result.link },
      { status: 201 },
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
