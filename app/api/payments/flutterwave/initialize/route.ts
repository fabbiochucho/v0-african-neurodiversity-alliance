import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET_KEY || ""
const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3"

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

    // Get user profile for email
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).single()

    const transactionRef = `ANDA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Prepare Flutterwave payment payload
    const paymentPayload = {
      tx_ref: transactionRef,
      amount: amount,
      currency: currency,
      payment_options: "card,mobilemoney,ussd",
      redirect_url: `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL}/api/payments/flutterwave/verify`,
      meta: {
        consumer_id: user.id,
        consumer_email: profile?.email,
      },
      customer: {
        email: profile?.email,
        phonenumber: "",
        name: "",
      },
      customizations: {
        title: `ANDA ${tier} Subscription`,
        description: `${tier} tier subscription for ANDA NeuroCare`,
        logo: "https://anda.example.com/logo.png",
      },
    }

    // Create payment transaction record
    const { data: transaction, error: txError } = await supabase
      .from("payment_transactions")
      .insert({
        transaction_id: transactionRef,
        amount,
        currency,
        status: "pending",
      })
      .select()
      .single()

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 400 })
    }

    // Create subscription record
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

    return NextResponse.json(
      {
        transactionRef,
        subscriptionId: subscription.id,
        // In production, would call Flutterwave API here
        // return Flutterwave hosted payment link
        paymentLink: `${FLUTTERWAVE_BASE_URL}/payments`,
        payload: paymentPayload,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
