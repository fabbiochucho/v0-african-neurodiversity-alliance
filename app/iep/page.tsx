// IEP Tracker Main Hub

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/lib/icons"
import Link from "next/link"
import { SUBSCRIPTION_TIERS } from "@/lib/constants/iep"
import type { SubscriptionTier } from "@/lib/types/iep"

export default function IEPTrackerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3C9C87]/5 via-[#FFC857]/5 to-[#0081A7]/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              IEP Tracker Add-on
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
              ANDA <span className="text-[#3C9C87]">NeuroCare</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto leading-relaxed">
              Create personalized Individualized Education Plans (IEPs), log progress against each goal, and share
              progress reports with the people supporting your learner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-lg px-8 py-6 bg-[#3C9C87] hover:bg-[#2d7a6a]">
                <Link href="/dashboard">
                  Go to Dashboard <Icons.ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 bg-transparent">
                <Link href="/iep/generate">Create New IEP</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Powerful IEP Management</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Everything you need to create, track, and report on individualized education plans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* IEP Generator */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-[#3C9C87]/20">
              <CardHeader>
                <div className="w-12 h-12 bg-[#3C9C87]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#3C9C87]/20 transition-colors">
                  <Icons.FileText className="h-6 w-6 text-[#3C9C87]" />
                </div>
                <CardTitle>IEP Generator</CardTitle>
                <CardDescription>
                  Create IEPs with suggested goals based on the support areas you select, then add your own.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href="/iep/generate">
                    Generate IEP <Icons.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-[#FFC857]/20">
              <CardHeader>
                <div className="w-12 h-12 bg-[#FFC857]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#FFC857]/20 transition-colors">
                  <Icons.TrendingUp className="h-6 w-6 text-[#FFC857]" />
                </div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Log progress against each goal and see how things are changing over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href="/dashboard">
                    View Dashboard <Icons.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Automated Reports */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-[#0081A7]/20">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0081A7]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#0081A7]/20 transition-colors">
                  <Icons.Mail className="h-6 w-6 text-[#0081A7]" />
                </div>
                <CardTitle>Progress Reports</CardTitle>
                <CardDescription>
                  Generate monthly and quarterly progress reports and email them to family, teachers or therapists (paid plans).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href="/iep/reports">
                    View Reports <Icons.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Plans</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Every plan includes the core IEP tracker. Paid plans add more learner profiles and reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tier) => {
              const plan = SUBSCRIPTION_TIERS[tier]
              return (
                <Card key={tier} className="border-2">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="text-3xl font-bold">${plan.price}</div>
                      <div className="text-sm text-muted-foreground">{plan.period ? `/${plan.period}` : "Free"}</div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Icons.Check className="h-4 w-4 text-[#3C9C87] mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/iep/settings/subscription">{plan.price ? "Choose plan" : "Get started"}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
