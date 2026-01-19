import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET_KEY || ""
const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const transactionId = searchParams.get("transaction_id")

    if (status !== "successful" || !transactionId) {
      redirect("/iep/settings/subscription?error=payment_failed")
    }

    // Verify with Flutterwave
    const verifyResponse = await fetch(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`, {
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET}`,
      },
    })

    if (!verifyResponse.ok) {
      redirect("/iep/settings/subscription?error=verification_failed")
    }

    const flutterWaveData = await verifyResponse.json()

    if (flutterWaveData.data.status !== "successful") {
      redirect("/iep/settings/subscription?error=payment_not_successful")
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Get subscription and update status
    const { data: transaction } = await supabase
      .from("payment_transactions")
      .select("subscription_id")
      .eq("flutterwave_transaction_id", transactionId)
      .single()

    if (transaction?.subscription_id) {
      // Update subscription
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          flutterwave_ref: transactionId,
          payment_date: new Date().toISOString(),
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", transaction.subscription_id)

      // Update payment transaction
      await supabase
        .from("payment_transactions")
        .update({
          status: "successful",
          flutterwave_transaction_id: transactionId,
        })
        .eq("id", transaction.subscription_id)
    }

    redirect("/iep/settings/subscription?success=payment_completed")
  } catch (err) {
    console.error(err)
    redirect("/iep/settings/subscription?error=verification_error")
  }
}
