import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminPage } from "@/components/admin/admin-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createServiceClient } from "@/lib/supabase/service"
import { requireStaff, staffForAction, type Staff } from "@/lib/admin"
import { can, type Permission } from "@/lib/admin/permissions"
import { logAdminAction } from "@/lib/admin/audit"
import { maskEmail } from "@/lib/admin/pii"
import { addTag, removeTag, suspendUser, unsuspendUser, type ActionResult } from "@/lib/admin/user-actions"

export const dynamic = "force-dynamic"
export const metadata = { title: "Bulk action | ANDA admin", robots: { index: false } }

const OPS: Record<string, { label: string; permission: Permission; needsValue: string }> = {
  tag_add: { label: "Add tag", permission: "support.notes", needsValue: "a tag" },
  tag_remove: { label: "Remove tag", permission: "support.notes", needsValue: "a tag" },
  suspend: { label: "Suspend", permission: "users.suspend", needsValue: "a reason" },
  unsuspend: { label: "Lift suspension", permission: "users.suspend", needsValue: "" },
}
const MAX_IDS = 200
const BATCH = 50
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function run(staff: Staff, op: string, uid: string, value: string, batch: string): Promise<ActionResult> {
  if (op === "tag_add") return addTag(staff, uid, value, batch)
  if (op === "tag_remove") return removeTag(staff, uid, value, batch)
  if (op === "suspend") return suspendUser(staff, uid, value, batch)
  return unsuspendUser(staff, uid, batch)
}

async function execute(formData: FormData) {
  "use server"
  const op = String(formData.get("op") ?? "")
  const spec = OPS[op]
  if (!spec) return
  const staff = await staffForAction(spec.permission)
  if (!staff) return
  const ids = formData.getAll("ids").map(String).filter((id) => UUID.test(id)).slice(0, MAX_IDS)
  const value = String(formData.get("value") ?? "").trim()
  if (String(formData.get("confirm") ?? "") !== "CONFIRM" || !ids.length || (spec.needsValue && !value)) return

  const batch = crypto.randomUUID()
  const results: { id: string; ok: boolean; message: string }[] = []
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH)
    const done = await Promise.all(chunk.map((id) => run(staff, op, id, value, batch).catch((e) => ({ ok: false as const, message: String(e) }))))
    done.forEach((r, j) => results.push({ id: chunk[j], ok: r.ok, message: r.message }))
  }
  // One entry holds the per-record result log; each successful change also has its own entry.
  await logAdminAction(staff, "bulk.run", { type: "bulk", id: batch, after: { op, value, count: ids.length, results } })
  redirect(`/admin/users/bulk?batch=${batch}`)
}

export default async function BulkPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[]; op?: string; value?: string; batch?: string }>
}) {
  const staff = await requireStaff("users.read")
  const p = await searchParams
  const back = { href: "/admin/users", label: "Users" }

  if (p.batch && UUID.test(p.batch)) {
    const { data } = await createServiceClient()
      .from("admin_audit_log")
      .select("after, created_at")
      .eq("action", "bulk.run")
      .eq("target_id", p.batch)
      .maybeSingle()
    const after = data?.after as { op: string; value: string; results: { id: string; ok: boolean; message: string }[] } | undefined
    const failed = after?.results.filter((r) => !r.ok) ?? []
    return (
      <AdminPage title="Bulk action results" back={back}>
        {!after ? (
          <p className="text-muted-foreground">No results for that batch.</p>
        ) : (
          <>
            <p>
              {OPS[after.op]?.label ?? after.op}
              {after.value ? ` (“${after.value}”)` : ""}: {after.results.length - failed.length} done, {failed.length} failed.
            </p>
            <ul className="divide-y rounded-lg border text-sm">
              {after.results.map((r) => (
                <li key={r.id} className="p-3 flex flex-wrap justify-between gap-2">
                  <Link href={`/admin/users/${r.id}`} className="text-primary underline font-mono">{r.id.slice(0, 8)}</Link>
                  <span className={r.ok ? "" : "text-destructive"}>{r.message}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminPage>
    )
  }

  const spec = p.op ? OPS[p.op] : undefined
  const ids = [p.ids ?? []].flat().filter((id) => UUID.test(id)).slice(0, MAX_IDS)
  const value = (p.value ?? "").trim()
  if (!spec || !can(staff.role, spec.permission)) redirect("/admin/users")

  const { data: sample } = await createServiceClient().from("profiles").select("id, email").in("id", ids.slice(0, 10))
  const problem = !ids.length ? "Select at least one account." : spec.needsValue && !value ? `Enter ${spec.needsValue}.` : null

  return (
    <AdminPage title={`${spec.label}: preview`} back={back}>
      {problem ? (
        <p role="alert" className="text-destructive">{problem} <Link href="/admin/users" className="underline">Go back</Link></p>
      ) : (
        <form action={execute} className="space-y-4">
          <p>
            This will <strong>{spec.label.toLowerCase()}</strong>
            {value ? <> (“{value}”)</> : null} for <strong>{ids.length}</strong> account{ids.length === 1 ? "" : "s"}.
            {ids.length > 10 ? " The first 10:" : ""}
          </p>
          <ul className="list-disc pl-6 text-sm">
            {(sample ?? []).map((s) => (
              <li key={s.id}>{maskEmail(s.email)}</li>
            ))}
          </ul>
          {ids.map((id) => (
            <input key={id} type="hidden" name="ids" value={id} />
          ))}
          <input type="hidden" name="op" value={p.op} />
          <input type="hidden" name="value" value={value} />
          <label htmlFor="confirm" className="block text-sm">
            Type <strong>CONFIRM</strong> to go ahead
          </label>
          <Input id="confirm" name="confirm" required pattern="CONFIRM" className="max-w-[12rem]" autoComplete="off" />
          <Button type="submit" variant={p.op === "suspend" ? "destructive" : "default"}>Run</Button>
        </form>
      )}
    </AdminPage>
  )
}
