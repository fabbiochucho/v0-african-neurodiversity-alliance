"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/lib/icons"
import { contactHref } from "@/lib/legal"
import { calmMessage } from "@/lib/calm"
import { useT } from "@/components/language-provider"
import type { MessageKey } from "@/lib/i18n"

function DonateStatusBanner() {
  const searchParams = useSearchParams()
  const tr = useT()
  const success = searchParams.get("success")
  const error = searchParams.get("error")

  if (success === "thank_you") {
    return (
      <div className="max-w-md mx-auto p-4 bg-primary/10 border border-primary/30 rounded-lg text-sm text-primary">
        {tr("donate.thanks")}
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
        {tr("donate.problem")} ({error.replace(/_/g, " ")})
      </div>
    )
  }

  return null
}

type PaymentProvider = "flutterwave" | "paystack"

export default function DonatePage() {
  const [donatingTier, setDonatingTier] = useState<string | null>(null)
  const [donateError, setDonateError] = useState<string | null>(null)
  const [provider, setProvider] = useState<PaymentProvider>("flutterwave")
  const tr = useT()

  const handleDonate = async (amount: number, tierName: string) => {
    setDonatingTier(tierName)
    setDonateError(null)

    try {
      const res = await fetch(`/api/payments/${provider}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "USD", tierName }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to start donation checkout")
      if (!data.paymentLink) throw new Error("No payment link returned")

      window.location.href = data.paymentLink
    } catch (err) {
      setDonateError(calmMessage(err))
      setDonatingTier(null)
    }
  }

  const donationTiers = [
    {
      amount: 5,
      name: "Friend",
      description: tr("donate.friendText"),
      benefits: [tr("donate.newsletter"), tr("donate.communityAccess")],
    },
    {
      amount: 25,
      name: "Supporter",
      description: tr("donate.supporterText"),
      benefits: [tr("donate.allFriend"), tr("donate.webinars"), tr("donate.recognition")],
      featured: true,
    },
    {
      amount: 100,
      name: "Champion",
      description: tr("donate.championText"),
      benefits: [tr("donate.allSupporter"), tr("donate.annualReport"), tr("donate.impactUpdates")],
    },
    {
      amount: 500,
      name: "Founder",
      description: tr("donate.founderText"),
      benefits: [tr("donate.allChampion"), tr("donate.advisory"), tr("donate.customReport")],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-terracotta/5 to-terracotta/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">{tr("donate.title")}</h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto leading-relaxed">
              {tr("donate.intro")}
            </p>
            <Suspense fallback={null}>
              <DonateStatusBanner />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">{tr("donate.impact")}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
            {[
              { icon: Icons.BookOpen, amount: "$10", description: tr("donate.impact10") },
              { icon: Icons.Users, amount: "$25", description: tr("donate.impact25") },
              { icon: Icons.Globe, amount: "$50", description: tr("donate.impact50") },
              { icon: Icons.Heart, amount: "$100", description: tr("donate.impact100") },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6 text-center">
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                  <div className="text-2xl font-bold text-primary mb-2">{item.amount}</div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Tiers */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">{tr("donate.chooseLevel")}</h2>
          </div>

          {donateError && (
            <div className="max-w-md mx-auto mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive text-center">
              {donateError}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm text-muted-foreground">{tr("donate.payWith")}</span>
            <div className="inline-flex rounded-lg border p-1 bg-background">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {donationTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`flex flex-col ${tier.featured ? "border-2 border-primary shadow-lg" : ""}`}
              >
                <CardHeader>
                  <CardTitle>{tr(`donate.tier.${tier.name}` as MessageKey)}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="text-3xl font-bold text-primary mt-4">${tier.amount}</div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 mb-6">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm">
                        <Icons.CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tier.featured ? "default" : "outline"}
                    disabled={donatingTier === tier.name}
                    onClick={() => handleDonate(tier.amount, tier.name)}
                  >
                    {donatingTier === tier.name ? tr("donate.redirecting") : tr("donate.donateAmount", { amount: `$${tier.amount}` })}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Ways to Help */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">{tr("donate.otherWays")}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Share2 className="h-5 w-5 text-primary" />
                  {tr("donate.share")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {tr("donate.shareText")}
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    const shareData = {
                      title: "African Neurodiversity Alliance",
                      text: "Support the African Neurodiversity Alliance (ANDA).",
                      url: typeof window !== "undefined" ? window.location.origin : "",
                    }
                    if (typeof navigator !== "undefined" && navigator.share) {
                      navigator.share(shareData).catch(() => {})
                    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(shareData.url)
                    }
                  }}
                >
                  {tr("donate.shareSocial")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Users className="h-5 w-5 text-terracotta" />
                  {tr("donate.volunteer")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {tr("donate.volunteerText")}
                </p>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href={contactHref("Volunteering with ANDA", `Where I am:
Skills I can offer:
Hours a month:
`)}>
                    {tr("donate.volunteerCta")}
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Building2 className="h-5 w-5 text-terracotta" />
                  {tr("donate.corporate")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {tr("donate.corporateText")}
                </p>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href={contactHref("Corporate partnership", `Organisation:
Your role:
What you have in mind:
`)}>
                    {tr("donate.emailUs")}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} African Neurodiversity Alliance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
