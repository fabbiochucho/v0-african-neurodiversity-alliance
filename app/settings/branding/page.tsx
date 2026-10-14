import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { getBranding } from "@/lib/branding"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { BrandingForm } from "./branding-form"

export default async function BrandingSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/settings/branding")

  const allowed = (await getEntitlement(supabase, user.id)).can("branding")
  const branding = allowed ? await getBranding(supabase, user.id) : null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-2xl space-y-6">
        <header>
          <h1 className="text-4xl font-bold mb-2">Branding</h1>
          <p className="text-muted-foreground">Your logo, name and colour on generated reports and report emails.</p>
        </header>
        {allowed ? (
          <BrandingForm initial={branding} />
        ) : (
          <UpgradePrompt message="Put your organisation's logo and colour on reports and report emails." requiredTier={FEATURE_MIN_TIER.branding} />
        )}
      </main>
    </div>
  )
}
