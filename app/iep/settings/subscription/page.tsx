"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/lib/icons"
import { createClient } from "@/lib/supabase/client"
import { SUBSCRIPTION_TIERS } from "@/lib/constants/iep"
import { effectiveTier, type SubscriptionRow } from "@/lib/entitlements"
import type { Subscription, SubscriptionTier } from "@/lib/types/iep"
import { calmMessage } from "@/lib/calm"

type SubscriptionWithPayments = Subscription & SubscriptionRow

function SubscriptionStatusBanner() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const error = searchParams.get("error")

  if (success === "payment_completed") {
    return (
      <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg text-sm text-primary">
        Payment completed successfully. Your subscription has been updated.
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
        There was a problem processing your payment ({error.replace(/_/g, " ")}). Please try again.
      </div>
    )
  }

  return null
}

type PaymentProvider = "flutterwave" | "paystack"

export default function SubscriptionSettingsPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithPayments[]>([])
  const [loading, setLoading] = useState(true)
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<PaymentProvider>("flutterwave")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("*, payment_transactions(status)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      setSubscriptions((data as SubscriptionWithPayments[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  // Same rule the server enforces: only a paid, unexpired, active row counts.
  const currentTier: SubscriptionTier = effectiveTier(subscriptions)
  const subscription = subscriptions.find((s) => s.tier === currentTier) ?? null

  const handleUpgrade = async (tier: SubscriptionTier) => {
    const plan = SUBSCRIPTION_TIERS[tier]
    if (!plan.price) return

    setUpgradingTier(tier)
    setError(null)

    try {
      const res = await fetch(`/api/payments/${provider}/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, amount: plan.price, currency: "USD" }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to start checkout")
      if (!data.paymentLink) throw new Error("No payment link returned")

      window.location.href = data.paymentLink
    } catch (err) {
      setError(calmMessage(err))
      setUpgradingTier(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <Icons.ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-balance mb-2">Subscription</h1>
            <p className="text-muted-foreground">Manage your ANDA NeuroCare plan and billing.</p>
          </div>

          <Suspense fallback={null}>
            <SubscriptionStatusBanner />
          </Suspense>

          <Card className="mb-10">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading subscription...</p>
              ) : (
                <div className="flex items-center gap-4">
                  <Badge className="bg-primary/10 text-primary text-base px-3 py-1 capitalize">
                    {SUBSCRIPTION_TIERS[currentTier]?.name || currentTier}
                  </Badge>
                  {subscription?.renewal_date && (
                    <span className="text-sm text-muted-foreground">
                      Renews {new Date(subscription.renewal_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {error && <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{error}</div>}

          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-muted-foreground">Pay with:</span>
            <div className="inline-flex rounded-lg border p-1">
              <button
                type="button"
                onClick={() => setProvider("flutterwave")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  provider === "flutterwave" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Flutterwave
              </button>
              <button
                type="button"
                onClick={() => setProvider("paystack")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  provider === "paystack" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Paystack
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tier) => {
              const plan = SUBSCRIPTION_TIERS[tier]
              const isCurrent = tier === currentTier

              return (
                <Card key={tier} className={isCurrent ? "border-2 border-primary" : ""}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      ${plan.price}
                      {plan.period ? `/${plan.period}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Icons.Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent || tier === "free" || upgradingTier === tier}
                      onClick={() => handleUpgrade(tier)}
                    >
                      {isCurrent ? "Current Plan" : upgradingTier === tier ? "Redirecting..." : "Choose Plan"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
