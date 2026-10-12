import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { BulkImport } from "./bulk-import"

export default async function BulkImportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/learners/import")

  const entitlement = await getEntitlement(supabase, user.id)
  const { count } = await supabase.from("learner_profiles").select("id", { count: "exact", head: true }).eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
        <header>
          <h1 className="text-4xl font-bold mb-2">Bulk enrollment</h1>
          <p className="text-muted-foreground">Add many learners at once from a CSV file.</p>
        </header>
        {entitlement.can("bulk_enrollment") ? (
          <BulkImport remaining={Math.max(0, entitlement.learnerLimit - (count ?? 0))} limit={entitlement.learnerLimit} />
        ) : (
          <UpgradePrompt message="Enroll a whole class or caseload from one CSV file." requiredTier={FEATURE_MIN_TIER.bulk_enrollment} />
        )}
      </main>
    </div>
  )
}
