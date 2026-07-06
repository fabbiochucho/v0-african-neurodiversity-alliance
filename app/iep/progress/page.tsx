import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/lib/icons"

interface GoalWithLogs {
  id: string
  goal_text: string
  domain: string | null
  progress_logs: { rating: number; logged_date: string; notes: string | null }[]
}

export default async function IEPProgressPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: learners } = await supabase
    .from("learner_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const learnerCards = []

  for (const learner of learners || []) {
    const { data: ieps } = await supabase.from("ieps").select("id").eq("learner_id", learner.id)
    const iepIds = (ieps || []).map((i) => i.id)

    let goals: GoalWithLogs[] = []
    if (iepIds.length > 0) {
      const { data } = await supabase
        .from("iep_goals")
        .select("id, goal_text, domain, progress_logs(rating, logged_date, notes)")
        .in("iep_id", iepIds)
      goals = (data || []) as unknown as GoalWithLogs[]
    }

    const { data: summaries } = await supabase
      .from("progress_summaries")
      .select("*")
      .eq("learner_id", learner.id)
      .order("week_start_date", { ascending: false })
      .limit(4)

    const domainProgress: Record<string, { total: number; count: number }> = {}
    let totalRating = 0
    let ratingCount = 0

    goals.forEach((goal) => {
      const ratings = (goal.progress_logs || []).map((l) => l.rating)
      if (ratings.length === 0) return
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
      const domain = goal.domain || "general"
      if (!domainProgress[domain]) domainProgress[domain] = { total: 0, count: 0 }
      domainProgress[domain].total += avg
      domainProgress[domain].count += 1
      totalRating += avg
      ratingCount += 1
    })

    const recentLogs = goals
      .flatMap((g) => (g.progress_logs || []).map((log) => ({ ...log, goalText: g.goal_text, domain: g.domain })))
      .sort((a, b) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime())
      .slice(0, 5)

    learnerCards.push({
      learner,
      overallProgress: ratingCount > 0 ? totalRating / ratingCount : 0,
      goalCount: goals.length,
      domainProgress: Object.entries(domainProgress).map(([domain, d]) => ({
        domain,
        average: d.total / d.count,
      })),
      recentLogs,
      summaries: summaries || [],
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <Link href="/iep/dashboard" className="inline-flex items-center gap-2 text-[#3C9C87] hover:underline mb-4">
              <Icons.ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-balance mb-2">Progress Tracking</h1>
            <p className="text-muted-foreground">
              Review logged progress and weekly summaries across all of your learners.
            </p>
          </div>

          {learnerCards.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Icons.TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No progress data yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create an IEP and start logging progress against its goals to see trends here.
                </p>
                <Button asChild className="bg-[#3C9C87] hover:bg-[#2d7a6a]">
                  <Link href="/iep/generate">Create New IEP</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {learnerCards.map(({ learner, overallProgress, goalCount, domainProgress, recentLogs, summaries }) => (
                <Card key={learner.id}>
                  <CardHeader>
                    <CardTitle>{learner.name}</CardTitle>
                    <CardDescription>
                      {goalCount} goal{goalCount === 1 ? "" : "s"} tracked
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="font-medium">Overall progress</span>
                        <span className="text-muted-foreground">{overallProgress.toFixed(1)}/5</span>
                      </div>
                      <Progress value={(overallProgress / 5) * 100} className="h-2" />
                    </div>

                    {domainProgress.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Progress by domain</h4>
                        <div className="flex flex-wrap gap-2">
                          {domainProgress.map(({ domain, average }) => (
                            <Badge key={domain} variant="secondary" className="capitalize">
                              {domain}: {average.toFixed(1)}/5
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {recentLogs.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Recent logs</h4>
                        <div className="space-y-2">
                          {recentLogs.map((log, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{log.goalText}</p>
                                {log.notes && <p className="text-muted-foreground text-xs">{log.notes}</p>}
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">{log.rating}/5</Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(log.logged_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {summaries.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Weekly summaries</h4>
                        <div className="space-y-2">
                          {summaries.map((summary: any) => (
                            <div key={summary.id} className="text-sm p-3 border rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">
                                Week of {summary.week_start_date}
                              </p>
                              <p>{summary.summary_text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {goalCount === 0 && (
                      <p className="text-sm text-muted-foreground">No goals logged for this learner yet.</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
