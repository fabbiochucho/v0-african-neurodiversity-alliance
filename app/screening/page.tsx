import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { getEntitlement } from "@/lib/entitlements"
import { isFederationEnabled } from "@/lib/federation/config"
import { NOT_A_DIAGNOSIS } from "@/lib/screening"
import { ScreeningRoster } from "./screening-roster"

export default async function ScreeningPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/screening")

  const [entitlement, { data: learners }, { data: screenings }] = await Promise.all([
    getEntitlement(supabase, user.id),
    supabase.from("learner_profiles").select("id, name").eq("user_id", user.id).order("name"),
    supabase.from("screenings").select("id, learner_id, kind, areas, source_note, created_at").order("created_at", { ascending: false }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <header>
            <h1 className="text-4xl font-bold text-balance mb-2">Screening</h1>
            <p className="text-muted-foreground">
              A quick check-in for each learner you support, using ANDA&apos;s five self-test questions answered from
              what you&apos;ve observed.
            </p>
          </header>
          <p role="note" className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            <strong>Not a diagnosis.</strong> {NOT_A_DIAGNOSIS}
          </p>

          {(learners ?? []).length === 0 ? (
            <p className="text-muted-foreground">
              <Link href="/iep/generate" className="text-primary hover:underline">
                Add a learner
              </Link>{" "}
              to screen them.
            </p>
          ) : (
            <ScreeningRoster
              learners={learners ?? []}
              screenings={screenings ?? []}
              canImportInDepth={entitlement.can("screening_in_depth") && isFederationEnabled()}
              inDepthUpsell={!entitlement.can("screening_in_depth")}
            />
          )}
        </div>
      </main>
    </div>
  )
}
