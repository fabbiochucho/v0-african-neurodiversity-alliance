import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { initializeFlutterwavePayment } from "@/lib/payments/flutterwave"
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

    const { tier, amount, currency = "USD" } = await request.json()

    if (!tier || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user profile for email/name
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", user.id)
      .single()

    const transactionRef = `ANDA-SUB-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

    // Create subscription record (RLS: subscriptions_insert_own allows this)
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        tier,
        status: "pending",
      })
      .select()
      .single()

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 400 })
    }

    // payment_transactions has no anon/user insert policy by design — write
    // it with the service role client instead of relaxing RLS.
    const service = createServiceClient()

    const { error: txError } = await service.from("payment_transactions").insert({
      subscription_id: subscription.id,
      transaction_id: transactionRef,
      amount,
      currency,
      status: "pending",
      purpose: "subscription",
    })

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 400 })
    }

    const result = await initializeFlutterwavePayment({
      tx_ref: transactionRef,
      amount,
      currency,
      payment_options: "card,mobilemoney,ussd",
      redirect_url: `${appUrl}/api/payments/flutterwave/verify`,
      meta: {
        consumer_id: user.id,
        subscription_id: subscription.id,
        purpose: "subscription",
      },
      customer: {
        email: profile?.email || user.email || "",
        name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || undefined,
      },
      customizations: {
        title: `ANDA ${tier} Subscription`,
        description: `${tier} tier subscription for ANDA NeuroCare`,
      },
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    return NextResponse.json(
      {
        transactionRef,
        subscriptionId: subscription.id,
        paymentLink: result.link,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
