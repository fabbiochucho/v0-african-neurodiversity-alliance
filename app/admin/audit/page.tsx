import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createServiceClient } from "@/lib/supabase/service"
import { requireStaff } from "@/lib/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "Audit log | ANDA admin", robots: { index: false } }

const PAGE = 50
type Params = { actor?: string; action?: string; target?: string; from?: string; to?: string; page?: string }
const DATE = /^\d{4}-\d{2}-\d{2}$/

export default async function AuditPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireStaff("audit.read")
  const p = await searchParams
  const page = Math.max(0, Number(p.page) || 0)

  // Filters are matched as plain text; PostgREST escapes the values.
  let q = createServiceClient()
    .from("admin_audit_log")
    .select("id, actor_email, action, target_type, target_id, before, after, ip, user_agent, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * PAGE, page * PAGE + PAGE - 1)
  if (p.actor?.trim()) q = q.ilike("actor_email", `%${p.actor.trim().replace(/[%_]/g, "")}%`)
  if (p.action?.trim()) q = q.ilike("action", `${p.action.trim().replace(/[%_]/g, "")}%`)
  if (p.target?.trim()) {
    const [type, id] = p.target.trim().split(":")
    q = q.eq("target_type", type)
    if (id) q = q.eq("target_id", id)
  }
  if (p.from && DATE.test(p.from)) q = q.gte("created_at", `${p.from}T00:00:00Z`)
  if (p.to && DATE.test(p.to)) q = q.lte("created_at", `${p.to}T23:59:59Z`)
  const { data: rows, count, error } = await q

  const pageLink = (n: number) => `/admin/audit?${new URLSearchParams({ ...p, page: String(n) } as Record<string, string>)}`

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <header className="space-y-2">
          <Link href="/admin" className="text-sm text-primary underline">
            Admin dashboard
          </Link>
          <h1 className="text-3xl font-bold">Audit log</h1>
          <p className="text-muted-foreground">
            Every admin action, newest first. Entries can&apos;t be edited or deleted, by anyone.
          </p>
        </header>

        <form className="flex flex-wrap gap-3 items-end" method="get">
          <label className="text-sm space-y-1" htmlFor="f-actor">
            <span className="block">Admin email contains</span>
            <Input name="actor" id="f-actor" defaultValue={p.actor} className="w-56" />
          </label>
          <label className="text-sm space-y-1" htmlFor="f-action">
            <span className="block">Action starts with</span>
            <Input name="action" id="f-action" defaultValue={p.action} placeholder="e.g. staff." className="w-44" />
          </label>
          <label className="text-sm space-y-1" htmlFor="f-target">
            <span className="block">Target (type or type:id)</span>
            <Input name="target" id="f-target" defaultValue={p.target} placeholder="e.g. staff" className="w-56" />
          </label>
          <label className="text-sm space-y-1" htmlFor="f-from">
            <span className="block">From</span>
            <Input name="from" id="f-from" type="date" defaultValue={p.from} />
          </label>
          <label className="text-sm space-y-1" htmlFor="f-to">
            <span className="block">To</span>
            <Input name="to" id="f-to" type="date" defaultValue={p.to} />
          </label>
          <Button type="submit">Filter</Button>
          <Link href="/admin/audit" className="text-sm text-primary underline pb-2">
            Clear
          </Link>
        </form>

        {error ? (
          <p className="text-destructive">Couldn&apos;t load the audit log. Has migration 059 been applied?</p>
        ) : !rows?.length ? (
          <p className="text-muted-foreground">No entries match.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <caption className="sr-only">Admin actions</caption>
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th scope="col" className="p-3">When (UTC)</th>
                  <th scope="col" className="p-3">Admin</th>
                  <th scope="col" className="p-3">Action</th>
                  <th scope="col" className="p-3">Target</th>
                  <th scope="col" className="p-3">Change</th>
                  <th scope="col" className="p-3">From</th>
                </tr>
              </thead>
              <tbody className="divide-y align-top">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 whitespace-nowrap">{new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</td>
                    <td className="p-3">{r.actor_email}</td>
                    <td className="p-3 font-mono">{r.action}</td>
                    <td className="p-3 break-all">{[r.target_type, r.target_id].filter(Boolean).join(":")}</td>
                    <td className="p-3">
                      {(r.before || r.after) && (
                        <details>
                          <summary className="cursor-pointer text-primary">Before / after</summary>
                          <pre className="mt-2 max-w-md overflow-x-auto text-xs whitespace-pre-wrap">
                            {JSON.stringify({ before: r.before, after: r.after }, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[14rem] break-words">
                      {r.ip}
                      <br />
                      {r.user_agent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <nav className="flex gap-4 text-sm" aria-label="Pages">
          {page > 0 && <Link href={pageLink(page - 1)} className="text-primary underline">Newer</Link>}
          {(count ?? 0) > (page + 1) * PAGE && <Link href={pageLink(page + 1)} className="text-primary underline">Older</Link>}
          <span className="text-muted-foreground">{count ?? 0} entries</span>
        </nav>
      </main>
    </div>
  )
}
