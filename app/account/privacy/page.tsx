import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { hasActiveConsent } from "@/lib/companion"
import { WithdrawButton, DeleteAccount } from "./privacy-actions"

// Brief §42. Wording: "designed to support applicable data-protection
// requirements" -- no compliance claims.
export default async function PrivacyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/account/privacy")

  const [{ data: learners }, { data: consents }, { data: team }, { data: links }, { data: audit }] = await Promise.all([
    supabase.from("learner_profiles").select("id, name").eq("user_id", user.id),
    supabase.from("ai_learner_consent_events").select("learner_id, action, consent_version, created_at").eq("user_id", user.id),
    supabase.from("support_team_members").select("id, learner_id, learner_name, invited_email, role, status, owner_id, member_user_id"),
    supabase.from("linked_accounts").select("id, remote_app, remote_email, scopes, created_at").eq("status", "active"),
    supabase.from("audit_log").select("id, actor_id, learner_id, action, resource, created_at").order("created_at", { ascending: false }).limit(50),
  ])

  const names = new Map((learners ?? []).map((l) => [l.id, l.name]))
  const aiConsents = (learners ?? [])
    .map((l) => {
      const events = (consents ?? []).filter((c) => c.learner_id === l.id)
      const latest = [...events].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
      return hasActiveConsent(events) ? { learner: l, since: latest.created_at } : null
    })
    .filter((x): x is { learner: { id: string; name: string }; since: string } => x !== null)
  const grantedTeam = (team ?? []).filter((m) => m.owner_id === user.id)
  const myTeams = (team ?? []).filter((m) => m.member_user_id === user.id && m.status === "active")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
        <header>
          <Link href="/account" className="text-primary hover:underline text-sm">
            Account
          </Link>
          <h1 className="text-4xl font-bold mt-2 mb-2">Privacy and your data</h1>
          <p className="text-muted-foreground">
            Every permission you&apos;ve given, in one place. ANDA is designed to support applicable data-protection
            requirements; you can withdraw any of these at any time.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learner information shared with AI chat</CardTitle>
            <CardDescription>Goals and a 30-day check-in summary sent to Anthropic when you choose that learner in chat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {aiConsents.length === 0 ? (
              <p className="text-muted-foreground">Not sharing for anyone.</p>
            ) : (
              aiConsents.map((c) => (
                <div key={c.learner.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {c.learner.name}, since {new Date(c.since).toLocaleDateString()}
                  </span>
                  <WithdrawButton
                    label="Withdraw"
                    url="/api/companion/consent"
                    method="POST"
                    body={{ learner_id: c.learner.id, action: "revoked" }}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Support-team access</CardTitle>
            <CardDescription>People you&apos;ve let see a learner&apos;s plan, and teams you&apos;re on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {grantedTeam.length === 0 && myTeams.length === 0 && <p className="text-muted-foreground">No team access.</p>}
            {grantedTeam.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {m.invited_email} can access {m.learner_name} as a {m.role}
                  {m.status === "pending" ? " (invited)" : ""}
                </span>
                <WithdrawButton label="Remove access" url={`/api/team/${m.id}`} method="DELETE" />
              </div>
            ))}
            {myTeams.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  You&apos;re on {m.learner_name}&apos;s team as a {m.role}
                </span>
                <WithdrawButton label="Leave team" url={`/api/team/${m.id}`} method="DELETE" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">NeuRafiki link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(links ?? []).length === 0 ? (
              <p className="text-muted-foreground">Not linked.</p>
            ) : (
              (links ?? []).map((l) => (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Linked to {l.remote_email ?? "a NeuRafiki account"} since {new Date(l.created_at).toLocaleDateString()}
                    {(l.scopes ?? []).length > 0 ? ` (${(l.scopes as string[]).join(", ")})` : ""}
                  </span>
                  <WithdrawButton label="Disconnect" url={`/api/federation/link/${l.id}`} method="PATCH" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <Link href="/export" className="text-primary hover:underline">
                Export your learners, goals, progress and reports
              </Link>{" "}
              (CSV or JSON).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Who has looked at or changed records</CardTitle>
            <CardDescription>The 50 most recent views by others, exports and changes to your learners&apos; records.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {(audit ?? []).length === 0 ? (
              <p className="text-muted-foreground">Nothing recorded yet.</p>
            ) : (
              <ul className="space-y-1">
                {(audit ?? []).map((a) => (
                  <li key={a.id}>
                    <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span> ·{" "}
                    {a.actor_id === user.id ? "You" : "A team member"} · {a.action}: {a.resource}
                    {a.learner_id && names.get(a.learner_id) ? ` (${names.get(a.learner_id)})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-lg">Delete your account</CardTitle>
            <CardDescription>
              Permanently deletes your learners, plans, goals, check-ins, reports, consents, team memberships, uploaded files
              and your login. This can&apos;t be undone. Payment records are kept for financial record-keeping, with your
              name removed from them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccount email={user.email ?? ""} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
