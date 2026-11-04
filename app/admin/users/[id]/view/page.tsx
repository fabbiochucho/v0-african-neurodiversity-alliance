import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminPage } from "@/components/admin/admin-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createServiceClient } from "@/lib/supabase/service"
import { requireStaff } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"

export const dynamic = "force-dynamic"
export const metadata = { title: "View as | ANDA admin", robots: { index: false } }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Read-only "view as": staff see what the account holds, to help them, without signing in as
// them or being able to change anything (ANDA holds children's data, so there's no impersonation).
// Free-text records, check-in notes, report contents and uploaded files are left out.
export default async function ViewAsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ reason?: string }>
}) {
  const staff = await requireStaff("users.view_as")
  const { id } = await params
  const reason = (await searchParams).reason?.trim().slice(0, 300) ?? ""
  if (!UUID.test(id)) notFound()
  const back = { href: `/admin/users/${id}`, label: "Back to the account" }

  if (reason.length < 5) {
    return (
      <AdminPage title="View as this user (read-only)" back={back}>
        <form method="get" className="space-y-3 max-w-lg">
          <p>Say why you need to see this account. The reason is saved in the audit log with your name.</p>
          <label htmlFor="reason" className="block text-sm">Reason (for example a support request)</label>
          <Input id="reason" name="reason" required minLength={5} maxLength={300} />
          <Button type="submit">Continue</Button>
        </form>
      </AdminPage>
    )
  }

  const db = createServiceClient()
  const { data: auth } = await db.auth.admin.getUserById(id)
  if (!auth.user) notFound()
  await logAdminAction(staff, "users.view_as", { type: "user", id, after: { reason } })

  const [{ data: profile }, { data: tier }, { data: learners }, { data: posts }, { data: team }] = await Promise.all([
    db.from("profiles").select("first_name").eq("id", id).maybeSingle(),
    db.rpc("entitled_tier", { p_user: id }),
    db.from("learner_profiles").select("id, name, age, country, created_at").eq("user_id", id).order("created_at"),
    db.from("community_posts").select("id, title, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
    db.from("support_team_members").select("id, learner_name, role, status").eq("owner_id", id),
  ])
  const learnerIds = (learners ?? []).map((l) => l.id)
  const [{ data: ieps }, { data: reports }] = await Promise.all([
    learnerIds.length ? db.from("ieps").select("id, learner_id, title, status").in("learner_id", learnerIds) : Promise.resolve({ data: [] }),
    learnerIds.length
      ? db.from("reports").select("id, learner_id, report_type, report_period, created_at").in("learner_id", learnerIds).order("created_at", { ascending: false }).limit(20)
      : Promise.resolve({ data: [] }),
  ])
  const iepIds = (ieps ?? []).map((p) => p.id)
  const { data: goals } = iepIds.length
    ? await db.from("iep_goals").select("id, iep_id, goal_text, status, approval_status").in("iep_id", iepIds)
    : { data: [] }
  const goalIds = (goals ?? []).map((g) => g.id)
  const { data: logs } = goalIds.length
    ? await db.from("progress_logs").select("goal_id, logged_date").in("goal_id", goalIds).order("logged_date", { ascending: false }).limit(200)
    : { data: [] }
  const lastLog = new Map<string, string>()
  for (const l of logs ?? []) if (!lastLog.has(l.goal_id)) lastLog.set(l.goal_id, l.logged_date)

  return (
    <div>
      <div role="status" className="sticky top-0 z-50 bg-amber-300 text-black px-4 py-3 text-sm font-medium flex flex-wrap justify-between gap-2">
        <span>
          Viewing {profile?.first_name ?? "this account"}&apos;s account as {staff.email}. Read-only. Reason: {reason}
        </span>
        <Link href={`/admin/users/${id}`} className="underline font-semibold">Exit</Link>
      </div>
      <AdminPage title={`${profile?.first_name ?? "Account"}'s ANDA`} back={back} intro={<p>Plan: {typeof tier === "string" ? tier : "free"}</p>}>
        {!learners?.length && <p className="text-muted-foreground">No learners added yet.</p>}
        {(learners ?? []).map((l) => {
          const plans = (ieps ?? []).filter((p) => p.learner_id === l.id)
          return (
            <Card key={l.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {l.name}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {[l.age != null && `${l.age} years`, l.country].filter(Boolean).join(" · ")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {!plans.length && <p className="text-muted-foreground">No support plan yet.</p>}
                {plans.map((p) => (
                  <div key={p.id}>
                    <p className="font-medium">{p.title} ({p.status})</p>
                    <ul className="list-disc pl-6">
                      {(goals ?? []).filter((g) => g.iep_id === p.id).map((g) => (
                        <li key={g.id}>
                          {g.goal_text} <span className="text-muted-foreground">· {g.status} · {g.approval_status} · last check-in {lastLog.get(g.id) ?? "none"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {(reports ?? []).some((r) => r.learner_id === l.id) && (
                  <p>
                    Reports:{" "}
                    {(reports ?? []).filter((r) => r.learner_id === l.id).map((r) => `${r.report_type} ${r.report_period ?? ""} (${r.created_at.slice(0, 10)})`).join("; ")}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
        <Card>
          <CardHeader><CardTitle className="text-lg">Support team and community</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Team invitations: {(team ?? []).map((t) => `${t.learner_name ?? "learner"} (${t.role}, ${t.status})`).join("; ") || "none"}</p>
            <p>Recent community posts: {(posts ?? []).map((p) => p.title).join("; ") || "none"}</p>
          </CardContent>
        </Card>
      </AdminPage>
    </div>
  )
}
