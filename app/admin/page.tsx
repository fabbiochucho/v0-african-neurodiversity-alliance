import Link from "next/link"
import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServiceClient } from "@/lib/supabase/service"
import { getAdminEmail } from "@/lib/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin dashboard | ANDA", robots: { index: false } }

// Shape returned by admin_stats() (scripts/052_admin_stats.sql). Counts only.
interface Stats {
  users: number
  confirmed: number
  new_7d: number
  new_30d: number
  active_7d: number
  funnel: Record<"signed_up" | "confirmed" | "added_learner" | "set_goal" | "logged_checkin" | "paid", number>
  plans: Record<string, number>
  weekly_signups: { week: string; n: number }[]
  community_posts: number
  digest_subscribers: number
}

const FUNNEL_STEPS: { key: keyof Stats["funnel"]; label: string }[] = [
  { key: "signed_up", label: "Signed up" },
  { key: "confirmed", label: "Confirmed email" },
  { key: "added_learner", label: "Added a learner" },
  { key: "set_goal", label: "Set a goal" },
  { key: "logged_checkin", label: "Logged a check-in" },
  { key: "paid", label: "On a paid plan" },
]

const pct = (n: number, of: number) => (of ? `${Math.round((n / of) * 100)}%` : "–")

export default async function AdminDashboardPage() {
  if (!(await getAdminEmail())) notFound()

  const { data, error } = await createServiceClient().rpc("admin_stats")
  const stats = data as Stats | null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin dashboard</h1>
            <p className="text-muted-foreground">
              Counts from ANDA&apos;s own database. No names, emails or tracking tools.
            </p>
          </div>
          <span className="flex gap-4">
            <Link href="/admin/submissions" className="text-primary underline">
              Directory suggestions
            </Link>
            <Link href="/admin/feeds" className="text-primary underline">
              Moderate feeds
            </Link>
          </span>
        </header>

        {error || !stats ? (
          <p role="alert" className="text-destructive">
            Couldn&apos;t load the numbers. Check that migration 052 is applied.
          </p>
        ) : (
          <>
            <section aria-labelledby="totals-heading">
              <h2 id="totals-heading" className="sr-only">
                Totals
              </h2>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Accounts", value: stats.users },
                  { label: "New in 7 days", value: stats.new_7d },
                  { label: "New in 30 days", value: stats.new_30d },
                  { label: "Logged a check-in in 7 days", value: stats.active_7d },
                  { label: "Paid plans", value: stats.funnel.paid },
                  { label: "Community posts", value: stats.community_posts },
                  { label: "Digest subscribers", value: stats.digest_subscribers },
                  { label: "Confirmed emails", value: stats.confirmed },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="p-4">
                      <dt className="text-sm text-muted-foreground">{s.label}</dt>
                      <dd className="text-2xl font-bold text-primary">{s.value}</dd>
                    </CardContent>
                  </Card>
                ))}
              </dl>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Where people drop off</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 font-medium">Step</th>
                      <th className="py-2 font-medium text-right">People</th>
                      <th className="py-2 font-medium text-right">Of sign-ups</th>
                      <th className="py-2 font-medium text-right">Of previous step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FUNNEL_STEPS.map((step, i) => {
                      const n = stats.funnel[step.key]
                      const prev = i ? stats.funnel[FUNNEL_STEPS[i - 1].key] : n
                      return (
                        <tr key={step.key} className="border-t">
                          <td className="py-2">{step.label}</td>
                          <td className="py-2 text-right font-medium">{n}</td>
                          <td className="py-2 text-right">{pct(n, stats.funnel.signed_up)}</td>
                          <td className="py-2 text-right">{i ? pct(n, prev) : "–"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sign-ups per week (last 12 weeks)</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.weekly_signups.length === 0 ? (
                    <p className="text-muted-foreground">No sign-ups in the last 12 weeks.</p>
                  ) : (
                    <ul className="space-y-2">
                      {stats.weekly_signups.map((w) => {
                        const max = Math.max(...stats.weekly_signups.map((x) => x.n))
                        return (
                          <li key={w.week} className="text-sm">
                            <span className="flex justify-between mb-1">
                              <span>Week of {new Date(w.week).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                              <span className="font-medium">{w.n}</span>
                            </span>
                            <span className="block h-2 rounded bg-muted" aria-hidden="true">
                              <span className="block h-2 rounded bg-primary" style={{ width: `${(w.n / max) * 100}%` }} />
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Paid plans by tier</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(stats.plans).length === 0 ? (
                    <p className="text-muted-foreground">No paid plans yet.</p>
                  ) : (
                    <dl className="space-y-2 text-sm">
                      {Object.entries(stats.plans).map(([tier, n]) => (
                        <div key={tier} className="flex justify-between border-b pb-2">
                          <dt className="capitalize">{tier}</dt>
                          <dd className="font-medium">{n}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
