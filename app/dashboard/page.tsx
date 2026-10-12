import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { PersonCard } from "@/components/person-summary"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getEntitlement } from "@/lib/entitlements"
import { SUBSCRIPTION_TIERS } from "@/lib/constants/iep"
import { loadJourneys } from "@/lib/journey-data"
import { summarisePerson } from "@/lib/journey"
import type { LearnerProfile } from "@/lib/types/iep"

// The unified, person-centred ANDA dashboard: one card per person being
// supported, answering "how are they doing, what are we working on, what's
// next" -- not KPI tiles.
export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirectTo=/dashboard")
  }

  const [{ data: profile }, { data: learners }, entitlement] = await Promise.all([
    supabase.from("profiles").select("first_name").eq("id", user.id).maybeSingle(),
    supabase.from("learner_profiles").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    getEntitlement(supabase, user.id),
  ])

  const people = await loadJourneys(supabase, (learners ?? []) as LearnerProfile[])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-balance mb-2">
                {profile?.first_name ? `Welcome back, ${profile.first_name}` : "Welcome back"}
              </h1>
              <p className="text-muted-foreground">
                The people you support, how they&apos;re doing, and what&apos;s next.
              </p>
            </div>
            <Button asChild className="bg-[#3C9C87] hover:bg-[#2d7a6a]">
              <Link href="/iep/generate">Add a person</Link>
            </Button>
          </header>

          {people.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center space-y-4">
                <h2 className="text-lg font-semibold">No one here yet</h2>
                <p className="text-muted-foreground">
                  Create a plan for the person you support. Their goals, check-ins and reports will build up into
                  their journey here.
                </p>
                <Button asChild className="bg-[#3C9C87] hover:bg-[#2d7a6a]">
                  <Link href="/iep/generate">Create a first plan</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <section aria-label="People you support" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {people.map(({ learner, input }) => (
                <PersonCard
                  key={learner.id}
                  learner={learner}
                  summary={summarisePerson(input, {
                    canReports: entitlement.can("reports"),
                    journeyHref: `/journey/${learner.id}#working-on`,
                  })}
                />
              ))}
            </section>
          )}

          <nav aria-label="More" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/iep/progress" className="hover:underline">
              All progress
            </Link>
            <Link href="/iep/reports" className="hover:underline">
              Reports
            </Link>
            <Link href="/iep/settings/subscription" className="hover:underline">
              Plan: {SUBSCRIPTION_TIERS[entitlement.tier].name}
            </Link>
            <Link href="/settings/connections" className="hover:underline">
              Connected accounts
            </Link>
            <form
              action={async () => {
                "use server"
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect("/auth/login")
              }}
            >
              <button type="submit" className="hover:underline">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </main>
    </div>
  )
}
