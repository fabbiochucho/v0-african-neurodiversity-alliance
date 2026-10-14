import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SUBSCRIPTION_TIERS } from "@/lib/constants/iep"
import { getEntitlement } from "@/lib/entitlements"
import { andaEntitlementsPayload, neuRafikiLinks } from "@/lib/federation/contract"
import { getNeuRafikiPlan } from "@/lib/federation/remote"
import { getSiblingAppUrl } from "@/lib/federation/config"

const ANDA_LABELS = { iep: "IEP", goals: "Goals", progress: "Progress", reports: "Reports", support_team: "Support team" } as const
const NR_LABELS = { assessment: "Assessment", ai_companion: "AI Companion", check_ins: "Check-ins", follow_up: "Follow-up" } as const

function Included({ items }: { items: { label: string; on: boolean }[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {items.map((i) => (
        <li key={i.label}>
          {i.label}: <span className={i.on ? "" : "text-muted-foreground"}>{i.on ? "included" : "not on this plan"}</span>
        </li>
      ))}
    </ul>
  )
}

// Brief §6: each product's plan side by side, each managed separately.
// Billing is fully separate; nothing on one side grants the other's features.
export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/account")

  const [{ tier }, nr] = await Promise.all([getEntitlement(supabase, user.id), getNeuRafikiPlan(supabase, user.id)])
  const anda = andaEntitlementsPayload(tier)
  const nrUrl = getSiblingAppUrl()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <header>
            <h1 className="text-4xl font-bold mb-2">Your account</h1>
            <p className="text-muted-foreground">
              Signed in as {user.email}. ANDA and NeuRafiki are separate products with separate plans and billing.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>ANDA</CardDescription>
                <CardTitle>{SUBSCRIPTION_TIERS[tier].name} plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Included items={(Object.keys(ANDA_LABELS) as (keyof typeof ANDA_LABELS)[]).map((k) => ({ label: ANDA_LABELS[k], on: anda.entitlements[k] }))} />
                <Button asChild>
                  <Link href="/iep/settings/subscription">Manage ANDA</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>NeuRafiki</CardDescription>
                <CardTitle>
                  {nr.state === "linked" ? `${nr.plan.plan} plan` : nr.state === "not_linked" ? "Not linked" : "Not available"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {nr.state === "linked" && (
                  <>
                    {nr.remoteEmail && <p className="text-muted-foreground">Linked to {nr.remoteEmail}</p>}
                    <Included
                      items={(Object.keys(NR_LABELS) as (keyof typeof NR_LABELS)[]).map((k) => ({ label: NR_LABELS[k], on: nr.plan.entitlements[k] }))}
                    />
                  </>
                )}
                {nr.state === "not_linked" && <p>Link your NeuRafiki account to see its plan here.</p>}
                {nr.state === "unavailable" && <p>We couldn&apos;t reach NeuRafiki just now. Your link is still in place; try again later.</p>}
                {nr.state === "disabled" && <p>Linking with NeuRafiki isn&apos;t switched on for this site.</p>}

                <div className="flex flex-wrap gap-2">
                  {nr.state === "not_linked" && (
                    <Button asChild>
                      <Link href="/settings/connections">Connect NeuRafiki</Link>
                    </Button>
                  )}
                  {nrUrl && nr.state !== "disabled" && (
                    <Button asChild variant="outline">
                      <a href={neuRafikiLinks(nrUrl).account()}>Manage NeuRafiki</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <nav aria-label="Account settings" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/settings/connections" className="hover:underline">
              Connected accounts
            </Link>
            <Link href="/account/privacy" className="hover:underline">
              Privacy and your data
            </Link>
            <Link href="/settings/accessibility" className="hover:underline">
              Display and sensory settings
            </Link>
          </nav>
        </div>
      </main>
    </div>
  )
}
