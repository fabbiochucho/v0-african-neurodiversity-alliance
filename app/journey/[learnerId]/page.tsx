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

const KIND_LABEL: Record<TimelineKind, string> = {
  plan: "Plan",
  assessment: "Assessment",
  goal: "Goal",
  achieved: "Achieved",
  progress: "Check-in",
  report: "Report",
  snapshot: "Snapshot",
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

  const [[journey], entitlement] = await Promise.all([
    loadJourneys(supabase, [learner as LearnerProfile]),
    getEntitlement(supabase, user.id),
  ])

  const summary = summarisePerson(journey.input, { canReports: entitlement.can("reports"), journeyHref: "#working-on" })
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
                    <CardContent>
                      <GoalCheckIn goalId={goal.id} />
                    </CardContent>
                  </Card>
                )
              })
            )}
          </section>

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
