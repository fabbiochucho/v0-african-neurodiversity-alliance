import Link from "next/link"
import { AdminPage, fieldClass } from "@/components/admin/admin-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createServiceClient } from "@/lib/supabase/service"
import { allowed, requireStaff } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import { maskEmail, maskName } from "@/lib/admin/pii"
import { PAGE, SORTS, STATUSES, searchArgs, type UserParams as Params, type UserRow } from "@/lib/admin/users"
import { TIER_RANK } from "@/lib/entitlements"

export const dynamic = "force-dynamic"
export const metadata = { title: "Users | ANDA admin", robots: { index: false } }

const day = (d: string | null) => (d ? d.slice(0, 10) : "–")
const statusOf = (r: UserRow) =>
  r.deleted_at ? "Deleted" : r.suspended_at ? "Suspended" : r.email_confirmed_at ? "Active" : "Unconfirmed"

export default async function UsersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const staff = await requireStaff("users.read")
  const p = await searchParams
  const page = Math.max(0, Number(p.page) || 0)
  const can = allowed(staff, ["users.reveal_pii", "exports.run", "users.suspend", "support.notes"])
  const reveal = p.reveal === "1" && can.has("users.reveal_pii")

  const { data, error } = await createServiceClient().rpc("admin_user_search", searchArgs(p, page))
  const rows = (data ?? []) as UserRow[]
  const total = rows[0]?.total ?? 0
  if (reveal) await logAdminAction(staff, "users.reveal_pii", { type: "user_list", after: { filters: { ...p, reveal: undefined }, rows: rows.length } })

  const link = (patch: Partial<Params>) => {
    const merged = { ...p, ...patch }
    const qs = new URLSearchParams(Object.entries(merged).filter(([, v]) => v) as [string, string][])
    return `/admin/users?${qs}`
  }
  const exportQs = new URLSearchParams(Object.entries({ ...p, page: undefined, reveal: undefined }).filter(([, v]) => v) as [string, string][])

  return (
    <AdminPage
      wide
      title="Users"
      intro={<p>Search by email, name, account ID or email domain. Emails and names are masked unless you reveal them; revealing is logged.</p>}
    >
      <form method="get" className="flex flex-wrap gap-3 items-end">
        <label htmlFor="f-q" className="text-sm space-y-1">
          <span className="block">Search</span>
          <Input id="f-q" name="q" defaultValue={p.q} className="w-64" placeholder="email, name, ID or domain" />
        </label>
        <label htmlFor="f-status" className="text-sm space-y-1">
          <span className="block">Status</span>
          <select id="f-status" name="status" defaultValue={p.status ?? ""} className={fieldClass}>
            <option value="">Any</option>
            {Object.entries(STATUSES).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
        <label htmlFor="f-plan" className="text-sm space-y-1">
          <span className="block">Plan</span>
          <select id="f-plan" name="plan" defaultValue={p.plan ?? ""} className={fieldClass}>
            <option value="">Any</option>
            {Object.keys(TIER_RANK).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label htmlFor="f-tag" className="text-sm space-y-1">
          <span className="block">Tag</span>
          <Input id="f-tag" name="tag" defaultValue={p.tag} className="w-36" />
        </label>
        <label htmlFor="f-sort" className="text-sm space-y-1">
          <span className="block">Sort</span>
          <select id="f-sort" name="sort" defaultValue={p.sort ?? "signed_up_desc"} className={fieldClass}>
            {Object.entries(SORTS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
        {reveal && <input type="hidden" name="reveal" value="1" />}
        <Button type="submit">Search</Button>
        <Link href="/admin/users" className="text-sm text-primary underline pb-2">Clear</Link>
      </form>

      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-muted-foreground">{total} account{total === 1 ? "" : "s"}</span>
        {can.has("users.reveal_pii") &&
          (reveal ? (
            <Link href={link({ reveal: undefined })} className="text-primary underline">Mask names and emails</Link>
          ) : (
            <Link href={link({ reveal: "1" })} className="text-primary underline">Reveal names and emails (logged)</Link>
          ))}
        {can.has("exports.run") && can.has("users.reveal_pii") && (
          <a href={`/api/admin/users/export?${exportQs}`} className="text-primary underline">Export these as CSV (logged)</a>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-destructive">Couldn&apos;t search users. Has migration 060 been applied?</p>
      ) : !rows.length ? (
        <p className="text-muted-foreground">No accounts match.</p>
      ) : (
        <form method="get" action="/admin/users/bulk" className="space-y-3">
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <caption className="sr-only">Accounts</caption>
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th scope="col" className="p-3"><span className="sr-only">Select</span></th>
                  <th scope="col" className="p-3">Name</th>
                  <th scope="col" className="p-3">Email</th>
                  <th scope="col" className="p-3">Plan</th>
                  <th scope="col" className="p-3">Status</th>
                  <th scope="col" className="p-3">Signed up</th>
                  <th scope="col" className="p-3">Last active</th>
                  <th scope="col" className="p-3">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.user_id}>
                    <td className="p-3">
                      <input type="checkbox" name="ids" value={r.user_id} aria-label={`Select ${reveal ? r.email : maskEmail(r.email)}`} className="h-4 w-4" />
                    </td>
                    <td className="p-3">
                      <Link href={`/admin/users/${r.user_id}`} className="text-primary underline">
                        {(reveal ? [r.first_name, r.last_name].filter(Boolean).join(" ") : maskName(r.first_name, r.last_name)) || "(no name)"}
                      </Link>
                    </td>
                    <td className="p-3 break-all">{reveal ? r.email : maskEmail(r.email)}</td>
                    <td className="p-3">{r.plan}</td>
                    <td className="p-3">{statusOf(r)}</td>
                    <td className="p-3 whitespace-nowrap">{day(r.signed_up_at)}</td>
                    <td className="p-3 whitespace-nowrap">{day(r.last_sign_in_at)}</td>
                    <td className="p-3">{r.tags.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(can.has("users.suspend") || can.has("support.notes")) && (
            <fieldset className="flex flex-wrap gap-3 items-end rounded-lg border p-3">
              <legend className="px-1 text-sm font-medium">With the selected accounts</legend>
              <label htmlFor="b-op" className="text-sm space-y-1">
                <span className="block">Action</span>
                <select id="b-op" name="op" className={fieldClass} defaultValue="tag_add">
                  {can.has("support.notes") && <option value="tag_add">Add tag</option>}
                  {can.has("support.notes") && <option value="tag_remove">Remove tag</option>}
                  {can.has("users.suspend") && <option value="suspend">Suspend</option>}
                  {can.has("users.suspend") && <option value="unsuspend">Lift suspension</option>}
                </select>
              </label>
              <label htmlFor="b-value" className="text-sm space-y-1">
                <span className="block">Tag or reason</span>
                <Input id="b-value" name="value" className="w-56" />
              </label>
              <Button type="submit" variant="outline">Preview</Button>
              <span className="text-xs text-muted-foreground">Nothing changes until you confirm on the next page.</span>
            </fieldset>
          )}
        </form>
      )}

      <nav className="flex gap-4 text-sm" aria-label="Pages">
        {page > 0 && <Link href={link({ page: String(page - 1) })} className="text-primary underline">Previous</Link>}
        {total > (page + 1) * PAGE && <Link href={link({ page: String(page + 1) })} className="text-primary underline">Next</Link>}
      </nav>
    </AdminPage>
  )
}
