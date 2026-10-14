import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { loadJourneys } from "@/lib/journey-data"
import { allGoals, summarisePerson } from "@/lib/journey"
import type { LearnerProfile } from "@/lib/types/iep"
import type { SupportTeamMember } from "@/lib/support-team"
import { StaffActions } from "./staff-actions"

// Multi-user dashboard: everyone you support and everyone on their support
// teams (built on the F.7 support-team model), with progress at a glance.
export default async function TeamDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/team-dashboard")

  const entitlement = await getEntitlement(supabase, user.id)
  if (!entitlement.can("team_dashboard")) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold">Team dashboard</h1>
          <UpgradePrompt
            message="See all your learners and their support-team staff in one place, with progress at a glance."
            requiredTier={FEATURE_MIN_TIER.team_dashboard}
          />
        </main>
      </div>
    )
  }

  const [{ data: learners }, { data: teamRows }] = await Promise.all([
    supabase.from("learner_profiles").select("*").eq("user_id", user.id).order("name"),
    supabase
      .from("support_team_members")
      .select("id, learner_id, learner_name, invited_email, role, permissions, status, member_user_id, invite_expires_at")
      .eq("owner_id", user.id),
  ])
  const people = await loadJourneys(supabase, (learners ?? []) as LearnerProfile[])
  const team = (teamRows ?? []) as SupportTeamMember[]

  const goalIds = people.flatMap((p) => allGoals(p.input).map((g) => g.id))
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: logs } =
    goalIds.length > 0
      ? await supabase.from("progress_logs").select("logged_by, logged_date").in("goal_id", goalIds).gte("logged_date", since)
      : { data: [] }
  const checkInsBy = (uid: string | null) => (logs ?? []).filter((l) => l.logged_by === uid).length

  const lastCheckIn = (p: (typeof people)[number]) =>
    allGoals(p.input)
      .flatMap((g) => g.progress_logs ?? [])
      .map((l) => l.logged_date)
      .sort()
      .pop()

  // One row per person on staff (owner + each invited email).
  const staff = Array.from(
    team.reduce((map, m) => {
      const row = map.get(m.invited_email) ?? { email: m.invited_email, memberships: [] as SupportTeamMember[] }
      row.memberships.push(m)
      return map.set(m.invited_email, row)
    }, new Map<string, { email: string; memberships: SupportTeamMember[] }>()),
  ).map(([, v]) => v)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <header>
            <h1 className="text-4xl font-bold text-balance mb-2">Team dashboard</h1>
            <p className="text-muted-foreground">
              {people.length} learner{people.length === 1 ? "" : "s"} · {staff.length + 1} staff including you
            </p>
          </header>

          <section aria-labelledby="learners-heading" className="space-y-3">
            <h2 id="learners-heading" className="text-2xl font-semibold">
              Learners
            </h2>
            {people.length === 0 ? (
              <p className="text-muted-foreground">No learners yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th scope="col" className="py-2 pr-4 font-medium">Learner</th>
                      <th scope="col" className="py-2 pr-4 font-medium">How they&apos;re doing</th>
                      <th scope="col" className="py-2 pr-4 font-medium">Last check-in</th>
                      <th scope="col" className="py-2 font-medium">Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((p) => (
                      <tr key={p.learner.id} className="border-b last:border-0 align-top">
                        <th scope="row" className="py-2 pr-4 text-left font-medium">
                          <Link href={`/journey/${p.learner.id}`} className="text-primary hover:underline">
                            {p.learner.name}
                          </Link>
                        </th>
                        <td className="py-2 pr-4">{summarisePerson(p.input).headline}</td>
                        <td className="py-2 pr-4">{lastCheckIn(p) ?? "None yet"}</td>
                        <td className="py-2">{team.filter((m) => m.learner_id === p.learner.id && m.status === "active").length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-labelledby="staff-heading" className="space-y-3">
            <h2 id="staff-heading" className="text-2xl font-semibold">
              Staff
            </h2>
            <p className="text-sm text-muted-foreground">
              Invite new staff from a learner&apos;s journey page. Check-in counts cover the last 30 days.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th scope="col" className="py-2 pr-4 font-medium">Person</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Learners and roles</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Check-ins</th>
                    <th scope="col" className="py-2 font-medium">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <th scope="row" className="py-2 pr-4 text-left font-medium">You ({user.email})</th>
                    <td className="py-2 pr-4">Owner of all</td>
                    <td className="py-2 pr-4">{checkInsBy(user.id)}</td>
                    <td className="py-2" />
                  </tr>
                  {staff.map((s) => (
                    <tr key={s.email} className="border-b last:border-0 align-top">
                      <th scope="row" className="py-2 pr-4 text-left font-medium">{s.email}</th>
                      <td className="py-2 pr-4">
                        <ul>
                          {s.memberships.map((m) => (
                            <li key={m.id}>
                              {m.learner_name} · <span className="capitalize">{m.role}</span>
                              {m.status === "pending" && <span className="text-muted-foreground"> · invited</span>}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-2 pr-4">{checkInsBy(s.memberships.find((m) => m.member_user_id)?.member_user_id ?? null)}</td>
                      <td className="py-2">
                        <StaffActions memberships={s.memberships} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
