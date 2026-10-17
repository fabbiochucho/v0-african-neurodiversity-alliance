import { redirect } from "next/navigation"
import { aiProvider } from "@/lib/ai"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DISCLAIMER, hasActiveConsent } from "@/lib/companion"
import { buildNudges, matchResources, type NudgeGoal, type ResourceLike } from "@/lib/companion-nudges"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { CompanionChat } from "./companion-chat"

// The companion is two things:
//  1. For everyone: suggestions built only from the learner's own data
//     (no AI, nothing sent anywhere).
//  2. For Pro and above: optional free-text AI chat.
export default async function CompanionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/companion")

  const [entitlement, { data: learners }, { data: resources }, { data: consentEvents }] = await Promise.all([
    getEntitlement(supabase, user.id),
    supabase.from("learner_profiles").select("id, name").eq("user_id", user.id).order("created_at"),
    supabase.from("learning_resources").select("id, title, description, url, provider").eq("is_published", true),
    supabase.from("ai_learner_consent_events").select("learner_id, action, consent_version, created_at").eq("user_id", user.id),
  ])

  const ids = (learners ?? []).map((l) => l.id)
  const { data: ieps } =
    ids.length > 0
      ? await supabase
          .from("ieps")
          .select("learner_id, iep_goals(id, goal_text, domain, status, target_completion_date, progress_logs(rating, logged_date))")
          .in("learner_id", ids)
      : { data: [] }

  const people = (learners ?? []).map((l) => {
    const goals = (ieps ?? [])
      .filter((i) => i.learner_id === l.id)
      .flatMap((i) => (i.iep_goals ?? []) as NudgeGoal[])
    const firstName = l.name.trim().split(/\s+/)[0]
    const areas = Array.from(new Set(goals.filter((g) => g.status === "in_progress").map((g) => g.domain ?? "")))
    return {
      id: l.id,
      name: l.name,
      nudges: buildNudges(firstName, goals),
      resources: matchResources((resources ?? []) as ResourceLike[], areas),
      consented: hasActiveConsent((consentEvents ?? []).filter((e) => e.learner_id === l.id)),
    }
  })

  const canChat = entitlement.can("ai_companion")
  const configured = aiProvider() !== null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-10">
          <header>
            <h1 className="text-4xl font-bold text-balance mb-2">Companion</h1>
            <p className="text-muted-foreground">
              Gentle prompts and next steps, worked out from your own check-ins. No AI is used here, and nothing leaves
              ANDA.
            </p>
          </header>

          {people.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Link href="/iep/generate" className="text-primary hover:underline">
                  Create a plan
                </Link>{" "}
                to get suggestions here.
              </CardContent>
            </Card>
          ) : (
            people.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle>For {p.name}</CardTitle>
                  <CardDescription>
                    <Link href={`/journey/${p.id}#working-on`} className="text-primary hover:underline">
                      Open {p.name}&apos;s journey to log a check-in
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-sm">
                  {p.nudges.length === 0 ? (
                    <p className="text-muted-foreground">Nothing needs attention right now.</p>
                  ) : (
                    <ul className="space-y-3">
                      {p.nudges.map((n, i) => (
                        <li key={i} className="rounded-lg border p-3">
                          {n.text}
                        </li>
                      ))}
                    </ul>
                  )}
                  {p.resources.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">From ANDA&apos;s Learning directory</h3>
                      <ul className="space-y-1">
                        {p.resources.map((r) => (
                          <li key={r.id}>
                            {r.url ? (
                              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {r.title}
                              </a>
                            ) : (
                              r.title
                            )}
                            {r.provider && <span className="text-muted-foreground"> · {r.provider}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          <section aria-labelledby="chat-heading" className="space-y-4">
            <h2 id="chat-heading" className="text-2xl font-semibold">
              Ask the AI companion
            </h2>
            <p role="note" className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
              {DISCLAIMER} Conversations aren&apos;t saved: closing or refreshing this page clears them. Built with Llama.
            </p>
            {!canChat ? (
              <UpgradePrompt
                message="Free-text chat with ANDA's AI companion. Everything above stays free."
                requiredTier={FEATURE_MIN_TIER.ai_companion}
              />
            ) : !configured ? (
              <p className="text-muted-foreground">AI chat isn&apos;t switched on yet. Please check back soon.</p>
            ) : (
              <CompanionChat learners={people.map(({ id, name, consented }) => ({ id, name, consented }))} />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
