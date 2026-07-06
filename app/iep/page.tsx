// IEP Tracker Main Hub

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/lib/icons"
import Link from "next/link"

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
              Generate personalized Individualized Education Plans (IEPs), track progress in real-time, and receive
              automated reports with ANDA branding. Empower your neurodivergent learners with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-lg px-8 py-6 bg-[#3C9C87] hover:bg-[#2d7a6a]">
                <Link href="/iep/dashboard">
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
                  Create adaptive IEPs with AI-suggested goals based on screening results and diagnosis domains.
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
                  Log daily progress, view weekly summaries, and track long-term trends with visual graphs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href="/iep/dashboard">
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
                <CardTitle>Automated Reports</CardTitle>
                <CardDescription>
                  Receive monthly and quarterly reports with ANDA branding, emailed to all authorized users.
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
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Flexible Pricing Plans</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Choose the plan that fits your needs, from individual users to large institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Free Tier */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Get started with basic features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-3xl font-bold">$0</div>
                  <div className="text-sm text-muted-foreground">Forever free</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Basic screening
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Single profile
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    IEP summary
                  </li>
                </ul>
                <Button variant="outline" className="w-full bg-transparent">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <Card className="border-2 border-[#3C9C87]">
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>For individual users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-3xl font-bold">$4.99</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Full screening
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Basic IEP summary
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Email reports
                  </li>
                </ul>
                <Button className="w-full bg-[#3C9C87] hover:bg-[#2d7a6a]">Subscribe Now</Button>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="border-2 border-[#FFC857]">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-[#FFC857] text-black">Most Popular</Badge>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For families and professionals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-3xl font-bold">$9.99</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Dynamic IEP generator
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Full progress tracker
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Multi-user dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Branded reports
                  </li>
                </ul>
                <Button className="w-full bg-[#FFC857] text-black hover:bg-[#ffb833]">Subscribe Now</Button>
              </CardContent>
            </Card>

            {/* Institutional Tier */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Institutional</CardTitle>
                <CardDescription>For schools and organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-3xl font-bold">$99</div>
                  <div className="text-sm text-muted-foreground">/year</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Bulk enrollment
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Multi-student dashboards
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Organization branding
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="h-4 w-4 text-[#3C9C87]" />
                    Data export
                  </li>
                </ul>
                <Button variant="outline" className="w-full bg-transparent">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
