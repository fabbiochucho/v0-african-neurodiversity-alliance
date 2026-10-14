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
import { PendingInvites } from "@/components/support-team"
import type { SupportTeamMember } from "@/lib/support-team"
import { EmptyState } from "@/components/empty-state"
import { NeuRafikiActions } from "@/components/neurafiki-actions"
import { getSiblingAppUrl } from "@/lib/federation/config"
import { getActiveLink } from "@/lib/federation/remote"
import { neuRafikiLinks } from "@/lib/federation/contract"
import { t } from "@/lib/i18n"

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

  const [{ data: profile }, { data: learners }, entitlement, { data: teamRows }] = await Promise.all([
    supabase.from("profiles").select("first_name").eq("id", user.id).maybeSingle(),
    supabase.from("learner_profiles").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    getEntitlement(supabase, user.id),
    // RLS returns memberships of mine plus pending invites to my email
    // (and teams I own, filtered out below).
    supabase
      .from("support_team_members")
      .select("id, learner_id, learner_name, invited_email, role, permissions, status, member_user_id, invite_expires_at")
      .neq("owner_id", user.id),
  ])

  const team = (teamRows ?? []) as SupportTeamMember[]
  const invites = team.filter((m) => m.status === "pending")
  const sharedIds = team.filter((m) => m.status === "active" && m.member_user_id === user.id).map((m) => m.learner_id)
  const { data: shared } =
    sharedIds.length > 0 ? await supabase.from("learner_profiles").select("*").in("id", sharedIds) : { data: [] }

  // Memberships whose learner RLS now hides: the owner's plan has lapsed
  // (scripts/034). Access returns automatically when they renew.
  const paused = team.filter(
    (m) => m.status === "active" && m.member_user_id === user.id && !(shared ?? []).some((l) => l.id === m.learner_id),
  )

  const nrUrl = getSiblingAppUrl()
  const linked = Boolean(nrUrl && (await getActiveLink(supabase, user.id)))

  const [people, sharedPeople] = await Promise.all([
    loadJourneys(supabase, (learners ?? []) as LearnerProfile[]),
    loadJourneys(supabase, (shared ?? []) as LearnerProfile[]),
  ])

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
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/iep/generate">Add a person</Link>
            </Button>
          </header>

          <PendingInvites invites={invites} />

          {people.length === 0 && sharedPeople.length === 0 ? (
            <EmptyState
              title={t("dashboard.empty.title")}
              description="Start with what you know about the person you support, add an assessment you already have, or take a NeuRafiki assessment first."
              actions={[
                { label: "Create Support Profile", href: "/people/new" },
                { label: "Add existing assessment", href: "/people/new?then=assessment" },
                { label: "Start NeuraFiki Assessment", href: nrUrl ? neuRafikiLinks(nrUrl).assessment() : "/self-test", external: true },
              ]}
            />
          ) : (
            people.length > 0 && (
            <section aria-label="People you support" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {people.map(({ learner, input }) => (
                <div key={learner.id} className="space-y-3">
                  <PersonCard
                    learner={learner}
                    summary={summarisePerson(input, {
                      canReports: entitlement.can("reports"),
                      journeyHref: `/journey/${learner.id}#working-on`,
                    })}
                  />
                  <NeuRafikiActions
                    learnerId={learner.id}
                    goalTitle={input.ieps.flatMap((i) => i.iep_goals ?? []).find((g) => g.status === "in_progress")?.goal_text}
                    nrUrl={nrUrl}
                    linked={linked}
                    canReports={entitlement.can("reports")}
                  />
                </div>
              ))}
            </section>
            )
          )}

          {paused.length > 0 && (
            <p role="status" className="rounded-lg border p-4 text-sm text-muted-foreground">
              Your access to {paused.map((m) => m.learner_name).join(", ")}&apos;s support team is paused because the
              plan of the person who invited you has lapsed. It comes back automatically if they renew.
            </p>
          )}

          {sharedPeople.length > 0 && (
            <section aria-labelledby="shared-heading" className="space-y-4">
              <h2 id="shared-heading" className="text-2xl font-semibold">
                On your support teams
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sharedPeople.map(({ learner, input }) => (
                  <PersonCard
                    key={learner.id}
                    learner={learner}
                    summary={summarisePerson(input, { journeyHref: `/journey/${learner.id}#working-on` })}
                  />
                ))}
              </div>
            </section>
          )}

          <nav aria-label="More" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/iep/progress" className="hover:underline">
              All progress
            </Link>
            <Link href="/iep/reports" className="hover:underline">
              Reports
            </Link>
            <Link href="/companion" className="hover:underline">
              Companion
            </Link>
            <Link href="/screening" className="hover:underline">
              Screening
            </Link>
            <Link href="/team-dashboard" className="hover:underline">
              Team dashboard
            </Link>
            <Link href="/learners/import" className="hover:underline">
              Bulk enrollment
            </Link>
            <Link href="/export" className="hover:underline">
              Export data
            </Link>
            <Link href="/settings/branding" className="hover:underline">
              Branding
            </Link>
            <Link href="/iep/settings/subscription" className="hover:underline">
              Plan: {SUBSCRIPTION_TIERS[entitlement.tier].name}
            </Link>
            <Link href="/account" className="hover:underline">
              Account
            </Link>
            <Link href="/people/new" className="hover:underline">
              Create support profile
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
