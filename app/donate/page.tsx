"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/lib/icons"

function DonateStatusBanner() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const error = searchParams.get("error")

  if (success === "thank_you") {
    return (
      <div className="max-w-md mx-auto p-4 bg-primary/10 border border-primary/30 rounded-lg text-sm text-primary">
        Thank you! Your donation was received successfully.
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        There was a problem processing your donation ({error.replace(/_/g, " ")}). Please try again.
      </div>
    )
  }

  return null
}

export default function DonatePage() {
  const [donatingTier, setDonatingTier] = useState<string | null>(null)
  const [donateError, setDonateError] = useState<string | null>(null)

  const handleDonate = async (amount: number, tierName: string) => {
    setDonatingTier(tierName)
    setDonateError(null)

    try {
      const res = await fetch("/api/payments/flutterwave/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "USD", tierName }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to start donation checkout")
      if (!data.paymentLink) throw new Error("No payment link returned")

      window.location.href = data.paymentLink
    } catch (err) {
      setDonateError(err instanceof Error ? err.message : "Failed to start donation checkout")
      setDonatingTier(null)
    }
  }

  const donationTiers = [
    {
      amount: 5,
      name: "Friend",
      description: "Support our mission with a small contribution",
      benefits: ["Monthly newsletter", "Community access"],
    },
    {
      amount: 25,
      name: "Supporter",
      description: "Make a meaningful impact",
      benefits: ["All Friend benefits", "Exclusive webinars", "Recognition on website"],
      featured: true,
    },
    {
      amount: 100,
      name: "Champion",
      description: "Become a major supporter",
      benefits: ["All Supporter benefits", "Annual report", "Direct impact updates"],
    },
    {
      amount: 500,
      name: "Founder",
      description: "Lead transformational change",
      benefits: ["All Champion benefits", "Advisory board access", "Custom impact report"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">Support Our Mission</h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto leading-relaxed">
              Your donation helps us provide free resources, education, and support to neurodivergent individuals across
              Africa.
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
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Your Impact</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
            {[
              { icon: Icons.BookOpen, amount: "$10", description: "Provides learning resources" },
              { icon: Icons.Users, amount: "$25", description: "Supports community programs" },
              { icon: Icons.Globe, amount: "$50", description: "Reaches 100 individuals" },
              { icon: Icons.Heart, amount: "$100", description: "Funds advocacy campaigns" },
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
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Choose Your Level of Support</h2>
          </div>

          {donateError && (
            <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
              {donateError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {donationTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`flex flex-col ${tier.featured ? "border-2 border-primary shadow-lg" : ""}`}
              >
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
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
                    {donatingTier === tier.name ? "Redirecting..." : `Donate $${tier.amount}`}
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
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Other Ways to Help</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Share2 className="h-5 w-5 text-primary" />
                  Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Spread the word about ANDA and help us reach more neurodivergent individuals.
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  Share on Social Media
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Users className="h-5 w-5 text-secondary" />
                  Volunteer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Join our team and contribute your skills to support our mission.
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Building2 className="h-5 w-5 text-accent" />
                  Corporate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Partner with ANDA for corporate sponsorships and matching gifts.
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2025 African Neurodiversity Alliance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
