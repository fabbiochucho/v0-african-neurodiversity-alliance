import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { EXPORT_TABLES } from "@/lib/data-export"

export default async function ExportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/export")

  const allowed = (await getEntitlement(supabase, user.id)).can("data_export")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-2xl space-y-6">
        <header>
          <h1 className="text-4xl font-bold mb-2">Export your data</h1>
          <p className="text-muted-foreground">
            Download the learners you created, with their goals, check-ins and reports. Learners shared with you through a
            support team aren&apos;t included; their owner can export them.
          </p>
        </header>
        {allowed ? (
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/api/export?format=json" className="text-primary hover:underline">
                Everything (JSON)
              </a>
            </li>
            {EXPORT_TABLES.map((t) => (
              <li key={t}>
                <a href={`/api/export?format=csv&table=${t}`} className="text-primary hover:underline capitalize">
                  {t} (CSV)
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <UpgradePrompt message="Download all your learners, goals, check-ins and reports as CSV or JSON." requiredTier={FEATURE_MIN_TIER.data_export} />
        )}
      </main>
    </div>
  )
}
