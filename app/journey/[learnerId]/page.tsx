import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { GoalCheckIn } from "@/components/goal-check-in"
import { SummaryCards } from "@/components/person-summary"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/lib/icons"
import { getEntitlement } from "@/lib/entitlements"
import { loadJourneys } from "@/lib/journey-data"
import { allGoals, buildTimeline, goalTrend, summarisePerson, type TimelineKind } from "@/lib/journey"
import type { LearnerProfile } from "@/lib/types/iep"
import { TeamManager } from "@/components/support-team"
import { WhatChanged } from "@/components/what-changed"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { FEATURE_MIN_TIER } from "@/lib/entitlements"
import { describePermissions, roleLabel, type SupportTeamMember } from "@/lib/support-team"
import { logAudit } from "@/lib/audit"

const KIND_LABEL: Record<TimelineKind, string> = {
  plan: "Plan",
  assessment: "Assessment",
  goal: "Goal",
  achieved: "Achieved",
  progress: "Check-in",
  report: "Report",
  snapshot: "Snapshot",
  check_in: "NeuRafiki check-in",
  observation: "Observation",
  professional_input: "Professional input",
}

const TREND_LABEL = { up: "improving", down: "slipping", steady: "steady" } as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export default async function JourneyPage({ params }: { params: { learnerId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirectTo=/journey/${params.learnerId}`)
  }

  // RLS limits this to people the caller is allowed to see.
  const { data: learner } = await supabase.from("learner_profiles").select("*").eq("id", params.learnerId).maybeSingle()
  if (!learner) notFound()

  const isOwner = learner.user_id === user.id
  // Record views by anyone other than the owner (e.g. support-team members).
  if (!isOwner) await logAudit({ actorId: user.id, ownerId: learner.user_id, learnerId: learner.id, action: "view", resource: "journey page" })
  const [[journey], entitlement, { data: teamRows }] = await Promise.all([
    loadJourneys(supabase, [learner as LearnerProfile]),
    getEntitlement(supabase, user.id),
    // Owner: the whole team. Member: just their own membership (RLS).
    supabase
      .from("support_team_members")
      .select("id, learner_id, learner_name, invited_email, role, permissions, status, member_user_id, invite_expires_at")
      .eq("learner_id", learner.id),
  ])
  const team = (teamRows ?? []) as SupportTeamMember[]
  const myMembership = isOwner ? null : team.find((m) => m.member_user_id === user.id && m.status === "active")
  const myPerms = myMembership?.permissions ?? []
  const can = (p: string) => isOwner || myPerms.includes(p as never)
  const canMarkAchieved = can("manage_plan") || can("approve")

  const summary = summarisePerson(journey.input, {
    canReports: isOwner && entitlement.can("reports"),
    journeyHref: "#working-on",
  })
  const goals = allGoals(journey.input)
  const active = goals.filter((g) => g.status === "in_progress")
  const timeline = buildTimeline(journey.input)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <header>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <Icons.ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-balance mb-2">{learner.name}&apos;s journey</h1>
            <p className="text-lg text-muted-foreground">{summary.headline}</p>
            {myMembership && (
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;re on {learner.name}&apos;s support team as {roleLabel(myMembership.role)}.{" "}
                {describePermissions(myPerms)}
              </p>
            )}
            {isOwner && (
              <Link href={`/iep/generate?learner=${learner.id}`} className="inline-block mt-3 text-sm font-medium text-primary hover:underline">
                Add goals in a new plan
              </Link>
            )}
            <Link href={`/journey/${learner.id}/profile`} className="inline-block mt-3 ml-4 text-sm font-medium text-primary hover:underline">
              Support profile and assessments
            </Link>
          </header>

          <SummaryCards summary={summary} />

          <section id="working-on" aria-labelledby="working-on-heading" className="space-y-4 scroll-mt-24">
            <h2 id="working-on-heading" className="text-2xl font-semibold">
              What we&apos;re working on
            </h2>
            {active.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No active goals.{" "}
                  <Link href="/iep/generate" className="text-primary hover:underline">
                    Create a plan
                  </Link>{" "}
                  to set some.
                </CardContent>
              </Card>
            ) : (
              active.map((goal) => {
                const trend = goalTrend(goal)
                return (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        {goal.domain && (
                          <Badge variant="secondary" className="capitalize">
                            {goal.domain}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {trend.count === 0
                            ? "No check-ins yet"
                            : `${trend.count} check-in${trend.count === 1 ? "" : "s"} · latest ${trend.latest}/5${
                                trend.direction ? ` · ${TREND_LABEL[trend.direction]}` : ""
                              }`}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{goal.goal_text}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(goal.baseline || goal.target || goal.measurement) && (
                        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <dt className="text-muted-foreground">Started from</dt>
                            <dd>{goal.baseline || "Not recorded"}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Aiming for</dt>
                            <dd>{goal.target || "Not recorded"}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Measured by</dt>
                            <dd>{goal.measurement || "Check-ins"}</dd>
                          </div>
                        </dl>
                      )}
                      {can("log_progress") && <GoalCheckIn goalId={goal.id} canMarkAchieved={canMarkAchieved} />}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </section>

          <section aria-labelledby="changed-heading" className="space-y-4">
            <h2 id="changed-heading" className="text-2xl font-semibold">
              What changed?
            </h2>
            <WhatChanged learnerId={learner.id} snapshots={journey.input.summaries} canSave={isOwner} />
          </section>

          {isOwner && (
            <section aria-labelledby="team-heading" className="space-y-4">
              <h2 id="team-heading" className="text-2xl font-semibold">
                Support team
              </h2>
              {entitlement.can("support_team") ? (
                <TeamManager
                  learnerId={learner.id}
                  members={team}
                  emailConfigured={Boolean(process.env.RESEND_API_KEY)}
                  learnerAge={learner.age ?? null}
                />
              ) : (
                <UpgradePrompt
                  message={`Invite caregivers, teachers and therapists to follow and contribute to ${learner.name}'s plan.`}
                  requiredTier={FEATURE_MIN_TIER.support_team}
                />
              )}
            </section>
          )}

          <section aria-labelledby="timeline-heading" className="space-y-4">
            <h2 id="timeline-heading" className="text-2xl font-semibold">
              Timeline
            </h2>
            {timeline.length === 0 ? (
              <p className="text-muted-foreground">Nothing has happened yet. Plans, check-ins and reports appear here.</p>
            ) : (
              <ol className="relative border-l border-border ml-2 space-y-6">
                {timeline.map((event) => (
                  <li key={event.id} className="ml-6">
                    <span
                      aria-hidden="true"
                      className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      <time dateTime={event.date}>{formatDate(event.date)}</time> · {KIND_LABEL[event.kind]}
                    </p>
                    <p className="font-medium">{event.title}</p>
                    {event.detail && <p className="text-sm text-muted-foreground whitespace-pre-line">{event.detail}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
