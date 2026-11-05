import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { AdminPage, fieldClass } from "@/components/admin/admin-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createServiceClient } from "@/lib/supabase/service"
import { allowed, requireStaff, staffForAction } from "@/lib/admin"
import type { Permission } from "@/lib/admin/permissions"
import { logAdminAction } from "@/lib/admin/audit"
import { maskEmail, maskName } from "@/lib/admin/pii"
import {
  addTag,
  forcePasswordReset,
  removeTag,
  restoreUser,
  revokeSessions,
  softDeleteUser,
  suspendUser,
  unsuspendUser,
  verifyEmail,
  type ActionResult,
} from "@/lib/admin/user-actions"
import { refundPayment } from "@/lib/admin/refunds"
import { FEATURES, clearFeatureCache, isFeatureKey } from "@/lib/features"

export const dynamic = "force-dynamic"
export const metadata = { title: "User | ANDA admin", robots: { index: false } }

const TABS = { overview: "Overview", billing: "Billing", activity: "Activity", notes: "Notes and tags", features: "Features" } as const
type Tab = keyof typeof TABS
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function done(uid: string, tab: Tab, r: ActionResult): never {
  redirect(`/admin/users/${uid}?tab=${tab}&msg=${encodeURIComponent(r.message)}`)
}
const field = (f: FormData, k: string) => String(f.get(k) ?? "").trim()

async function act(formData: FormData) {
  "use server"
  const uid = field(formData, "uid")
  const op = field(formData, "op")
  if (!UUID.test(uid)) return
  const need: Record<string, Permission> = {
    suspend: "users.suspend",
    unsuspend: "users.suspend",
    reset: "users.manage",
    revoke: "users.manage",
    verify: "users.manage",
    delete: "users.manage",
    restore: "users.manage",
  }
  if (!need[op]) return
  const staff = await staffForAction(need[op])
  if (!staff) return
  let r: ActionResult
  if (op === "suspend") {
    const reason = field(formData, "reason")
    r = reason ? await suspendUser(staff, uid, reason) : { ok: false, message: "Give a reason for the suspension." }
  } else if (op === "unsuspend") r = await unsuspendUser(staff, uid)
  else if (op === "reset") r = await forcePasswordReset(staff, uid)
  else if (op === "revoke") r = await revokeSessions(staff, uid)
  else if (op === "verify") r = await verifyEmail(staff, uid)
  else if (op === "restore") r = await restoreUser(staff, uid)
  else {
    const { data } = await createServiceClient().auth.admin.getUserById(uid)
    const typed = field(formData, "confirm").toLowerCase()
    r =
      data.user?.email && typed === data.user.email.toLowerCase()
        ? await softDeleteUser(staff, uid, field(formData, "reason"))
        : { ok: false, message: "Type the account's email exactly to delete it." }
  }
  done(uid, "overview", r)
}

async function refund(formData: FormData) {
  "use server"
  const uid = field(formData, "uid")
  const staff = await staffForAction("billing.refund")
  if (!staff || !UUID.test(uid)) return
  done(uid, "billing", await refundPayment(staff, field(formData, "tx"), field(formData, "amount"), field(formData, "confirm")))
}

async function notes(formData: FormData) {
  "use server"
  const uid = field(formData, "uid")
  const op = field(formData, "op")
  const staff = await staffForAction("support.notes")
  if (!staff || !UUID.test(uid)) return
  const db = createServiceClient()
  let r: ActionResult = { ok: false, message: "Nothing changed." }
  if (op === "add") {
    const body = field(formData, "body").slice(0, 5000)
    if (body) {
      const { data, error } = await db.from("account_notes").insert({ user_id: uid, body, author_email: staff.email }).select("id").single()
      if (!error) {
        await logAdminAction(staff, "notes.add", { type: "user", id: uid, after: { note_id: data.id } })
        r = { ok: true, message: "Note added." }
      }
    }
  } else if (op === "pin" || op === "unpin" || op === "delete") {
    const noteId = field(formData, "note")
    const { data: before } = await db.from("account_notes").select("body, pinned, author_email").eq("id", noteId).eq("user_id", uid).maybeSingle()
    if (before) {
      const { error } =
        op === "delete"
          ? await db.from("account_notes").delete().eq("id", noteId)
          : await db.from("account_notes").update({ pinned: op === "pin", updated_at: new Date().toISOString() }).eq("id", noteId)
      if (!error) {
        await logAdminAction(staff, `notes.${op}`, { type: "user", id: uid, before: { note_id: noteId, ...before }, after: op === "delete" ? null : { pinned: op === "pin" } })
        r = { ok: true, message: op === "delete" ? "Note deleted." : op === "pin" ? "Note pinned." : "Note unpinned." }
      }
    }
  } else if (op === "tag_add") r = await addTag(staff, uid, field(formData, "tag"))
  else if (op === "tag_remove") r = await removeTag(staff, uid, field(formData, "tag"))
  done(uid, "notes", r)
}

async function featureOverride(formData: FormData) {
  "use server"
  const uid = field(formData, "uid")
  const key = field(formData, "key")
  const value = field(formData, "value")
  const staff = await staffForAction("features.edit")
  if (!staff || !UUID.test(uid) || !isFeatureKey(key)) return
  const db = createServiceClient()
  // A target needs its feature row; create it switched on (the default) if it's not there yet.
  await db.from("feature_controls").upsert({ key, updated_by: staff.email }, { onConflict: "key", ignoreDuplicates: true })
  const { data: before } = await db.from("feature_targets").select("enabled").eq("feature_key", key).eq("scope", "user").eq("scope_value", uid).maybeSingle()
  const { error } =
    value === "default"
      ? await db.from("feature_targets").delete().eq("feature_key", key).eq("scope", "user").eq("scope_value", uid)
      : await db
          .from("feature_targets")
          .upsert(
            { feature_key: key, scope: "user", scope_value: uid, enabled: value === "on", updated_by: staff.email, updated_at: new Date().toISOString() },
            { onConflict: "feature_key,scope,scope_value" },
          )
  clearFeatureCache(key)
  if (!error) await logAdminAction(staff, "features.user_override", { type: "user", id: uid, before: before ?? null, after: { key, value } })
  done(uid, "features", error ? { ok: false, message: error.message } : { ok: true, message: `${FEATURES[key]}: ${value}.` })
}

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; msg?: string; reveal?: string }>
}) {
  const staff = await requireStaff("users.read")
  const { id } = await params
  const sp = await searchParams
  if (!UUID.test(id)) notFound()
  const tab: Tab = sp.tab && sp.tab in TABS ? (sp.tab as Tab) : "overview"
  const can = allowed(staff, ["users.reveal_pii", "users.suspend", "users.manage", "users.view_as", "billing.read", "billing.refund", "support.notes", "features.edit", "audit.read"])
  const reveal = sp.reveal === "1" && can.has("users.reveal_pii")

  const db = createServiceClient()
  const { data: auth } = await db.auth.admin.getUserById(id)
  const user = auth.user
  if (!user) notFound()
  const [{ data: profile }, { data: status }, { data: tags }, { data: tier }] = await Promise.all([
    db.from("profiles").select("first_name, last_name, role, organization_id").eq("id", id).maybeSingle(),
    db.from("account_admin_status").select("*").eq("user_id", id).maybeSingle(),
    db.from("account_tags").select("tag").eq("user_id", id).order("tag"),
    db.rpc("entitled_tier", { p_user: id }),
  ])
  if (reveal) await logAdminAction(staff, "users.reveal_pii", { type: "user", id })

  const name = reveal
    ? [profile?.first_name, profile?.last_name].filter(Boolean).join(" ")
    : maskName(profile?.first_name, profile?.last_name)
  const email = reveal ? user.email : maskEmail(user.email)
  const tabLink = (t: Tab) => `/admin/users/${id}?tab=${t}${reveal ? "&reveal=1" : ""}`

  return (
    <AdminPage
      title={name || "(no name)"}
      back={{ href: "/admin/users", label: "Users" }}
      message={sp.msg}
      intro={
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <span>{email}</span>
          <span>Plan: {typeof tier === "string" ? tier : "free"}</span>
          <span>{status?.deleted_at ? "Deleted (restorable)" : status?.suspended_at ? "Suspended" : user.email_confirmed_at ? "Active" : "Email not confirmed"}</span>
          {can.has("users.reveal_pii") && !reveal && (
            <Link href={`/admin/users/${id}?tab=${tab}&reveal=1`} className="text-primary underline">Reveal name and email (logged)</Link>
          )}
          {can.has("users.view_as") && (
            <Link href={`/admin/users/${id}/view`} className="text-primary underline">View as this user (read-only)</Link>
          )}
        </p>
      }
    >
      <nav aria-label="User sections" className="flex flex-wrap gap-2 border-b pb-2">
        {(Object.keys(TABS) as Tab[])
          .filter((t) => t !== "billing" || can.has("billing.read"))
          .filter((t) => t !== "activity" || can.has("audit.read"))
          .filter((t) => t !== "notes" || can.has("support.notes"))
          .map((t) => (
            <Link
              key={t}
              href={tabLink(t)}
              aria-current={t === tab ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-sm ${t === tab ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {TABS[t]}
            </Link>
          ))}
      </nav>

      {tab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Account</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[10rem_1fr] gap-2 text-sm">
                <dt className="text-muted-foreground">Account ID</dt><dd className="font-mono break-all">{id}</dd>
                <dt className="text-muted-foreground">Signed up</dt><dd>{user.created_at?.slice(0, 16).replace("T", " ")}</dd>
                <dt className="text-muted-foreground">Last sign-in</dt><dd>{user.last_sign_in_at?.slice(0, 16).replace("T", " ") ?? "never"}</dd>
                <dt className="text-muted-foreground">Email confirmed</dt><dd>{user.email_confirmed_at ? user.email_confirmed_at.slice(0, 10) : "no"}</dd>
                <dt className="text-muted-foreground">2FA</dt><dd>{(user.factors ?? []).some((f) => f.status === "verified") ? "on" : "off"}</dd>
                <dt className="text-muted-foreground">Tags</dt><dd>{(tags ?? []).map((t) => t.tag).join(", ") || "–"}</dd>
                {status?.suspended_at && (<><dt className="text-muted-foreground">Suspended</dt><dd>{status.suspended_at.slice(0, 10)}: {status.suspended_reason}</dd></>)}
                {status?.deleted_at && (<><dt className="text-muted-foreground">Deletes on</dt><dd>{status.delete_after?.slice(0, 10)} ({status.deleted_reason || "no reason given"})</dd></>)}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              {can.has("users.manage") && (
                <div className="flex flex-wrap gap-2">
                  {[
                    ["reset", "Send password reset"],
                    ["revoke", "Sign out everywhere"],
                    ...(!user.email_confirmed_at ? [["verify", "Mark email confirmed"]] : []),
                  ].map(([op, label]) => (
                    <form key={op} action={act}>
                      <input type="hidden" name="uid" value={id} />
                      <input type="hidden" name="op" value={op} />
                      <Button type="submit" size="sm" variant="outline">{label}</Button>
                    </form>
                  ))}
                </div>
              )}
              {can.has("users.suspend") && !status?.deleted_at && (
                status?.suspended_at ? (
                  <form action={act}>
                    <input type="hidden" name="uid" value={id} />
                    <input type="hidden" name="op" value="unsuspend" />
                    <Button type="submit" size="sm">Lift suspension</Button>
                  </form>
                ) : (
                  <form action={act} className="flex flex-wrap gap-2 items-end">
                    <input type="hidden" name="uid" value={id} />
                    <input type="hidden" name="op" value="suspend" />
                    <label htmlFor="s-reason" className="space-y-1"><span className="block">Suspension reason</span>
                      <Input id="s-reason" name="reason" required maxLength={500} className="w-64" />
                    </label>
                    <Button type="submit" size="sm" variant="destructive">Suspend</Button>
                  </form>
                )
              )}
              {can.has("users.manage") && (
                status?.deleted_at ? (
                  <form action={act}>
                    <input type="hidden" name="uid" value={id} />
                    <input type="hidden" name="op" value="restore" />
                    <Button type="submit" size="sm">Restore account</Button>
                  </form>
                ) : (
                  <details className="rounded-md border border-destructive/40 p-3">
                    <summary className="cursor-pointer text-destructive">Delete account (restorable for 30 days)</summary>
                    <form action={act} className="mt-3 space-y-2">
                      <input type="hidden" name="uid" value={id} />
                      <input type="hidden" name="op" value="delete" />
                      <p>The account is suspended now and permanently deleted after 30 days, with its learners and records. Payment records are kept.</p>
                      <label htmlFor="d-reason" className="block">Reason</label>
                      <Input id="d-reason" name="reason" maxLength={500} />
                      <label htmlFor="d-confirm" className="block">Type the account&apos;s email to confirm</label>
                      <Input id="d-confirm" name="confirm" required autoComplete="off" />
                      <Button type="submit" size="sm" variant="destructive">Delete account</Button>
                    </form>
                  </details>
                )
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "billing" && can.has("billing.read") && <BillingTab uid={id} email={user.email ?? ""} canRefund={can.has("billing.refund")} />}
      {tab === "activity" && can.has("audit.read") && <ActivityTab uid={id} />}
      {tab === "notes" && can.has("support.notes") && <NotesTab uid={id} tags={(tags ?? []).map((t) => t.tag)} />}
      {tab === "features" && <FeaturesTab uid={id} canEdit={can.has("features.edit")} />}
    </AdminPage>
  )
}

async function BillingTab({ uid, email, canRefund }: { uid: string; email: string; canRefund: boolean }) {
  const db = createServiceClient()
  const { data: subs } = await db
    .from("subscriptions")
    .select("id, tier, status, amount_paid, payment_date, renewal_date, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
  const subIds = (subs ?? []).map((s) => s.id)
  const cols = "id, subscription_id, amount, currency, status, provider, purpose, created_at, refunded_at, refund_amount"
  const [{ data: txs }, { data: gifts }] = await Promise.all([
    subIds.length ? db.from("payment_transactions").select(cols).in("subscription_id", subIds).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    email ? db.from("payment_transactions").select(cols).eq("donor_email", email).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
  ])
  const payments = [...(txs ?? []), ...(gifts ?? [])]
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Plan history</CardTitle></CardHeader>
        <CardContent>
          {!subs?.length ? <p className="text-sm text-muted-foreground">No paid plans.</p> : (
            <ul className="divide-y text-sm">
              {subs.map((s) => (
                <li key={s.id} className="py-2 flex flex-wrap justify-between gap-2">
                  <span className="font-medium">{s.tier}</span>
                  <span className="text-muted-foreground">{s.status} · paid {s.payment_date?.slice(0, 10) ?? "–"} · ends {s.renewal_date?.slice(0, 10) ?? "–"} · no automatic renewal</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-lg">Payments</CardTitle></CardHeader>
        <CardContent>
          {!payments.length ? <p className="text-sm text-muted-foreground">No payments.</p> : (
            <ul className="divide-y text-sm">
              {payments.map((t) => (
                <li key={t.id} className="py-3 space-y-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span>{t.created_at?.slice(0, 10)} · {t.purpose ?? "plan"} · {t.provider ?? "flutterwave"}</span>
                    <span>
                      {t.amount} {t.currency} · <strong>{t.refunded_at ? `refunded ${t.refund_amount}` : t.status}</strong>
                    </span>
                  </div>
                  {canRefund && t.status === "successful" && !t.refunded_at && (
                    <details>
                      <summary className="cursor-pointer text-primary">Refund</summary>
                      <form action={refund} className="mt-2 flex flex-wrap gap-2 items-end">
                        <input type="hidden" name="uid" value={uid} />
                        <input type="hidden" name="tx" value={t.id} />
                        <label htmlFor={`amt-${t.id}`} className="space-y-1"><span className="block">Amount (empty = full)</span>
                          <Input id={`amt-${t.id}`} name="amount" inputMode="decimal" className="w-32" />
                        </label>
                        <label htmlFor={`rc-${t.id}`} className="space-y-1"><span className="block">Type REFUND</span>
                          <Input id={`rc-${t.id}`} name="confirm" required autoComplete="off" className="w-32" />
                        </label>
                        <Button type="submit" size="sm" variant="destructive">Refund</Button>
                      </form>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

async function ActivityTab({ uid }: { uid: string }) {
  const db = createServiceClient()
  const [{ data: admin }, { data: own }] = await Promise.all([
    db.from("admin_audit_log").select("id, actor_email, action, after, created_at").eq("target_type", "user").eq("target_id", uid).order("created_at", { ascending: false }).limit(50),
    db.from("audit_log").select("id, action, resource, created_at").eq("owner_id", uid).order("created_at", { ascending: false }).limit(50),
  ])
  const events = [
    ...(admin ?? []).map((a) => ({ id: `a${a.id}`, at: a.created_at, who: `Staff: ${a.actor_email}`, what: a.action })),
    ...(own ?? []).map((o) => ({ id: `o${o.id}`, at: o.created_at, who: "Account activity", what: `${o.action}: ${o.resource}` })),
  ].sort((x, y) => (x.at < y.at ? 1 : -1))
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Timeline</CardTitle></CardHeader>
      <CardContent>
        {!events.length ? <p className="text-sm text-muted-foreground">No activity recorded.</p> : (
          <ol className="divide-y text-sm">
            {events.map((e) => (
              <li key={e.id} className="py-2 grid sm:grid-cols-[10rem_14rem_1fr] gap-2">
                <span className="text-muted-foreground">{e.at.slice(0, 16).replace("T", " ")}</span>
                <span>{e.who}</span>
                <span className="break-words">{e.what}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

async function NotesTab({ uid, tags }: { uid: string; tags: string[] }) {
  const { data: rows } = await createServiceClient()
    .from("account_notes")
    .select("id, body, author_email, pinned, created_at")
    .eq("user_id", uid)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
  const hidden = (op: string, extra?: Record<string, string>) => (
    <>
      <input type="hidden" name="uid" value={uid} />
      <input type="hidden" name="op" value={op} />
      {Object.entries(extra ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
    </>
  )
  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Internal notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Only staff see these. Don&apos;t paste screening answers, reports or health details here.</p>
          <form action={notes} className="space-y-2">
            {hidden("add")}
            <label htmlFor="n-body" className="sr-only">New note</label>
            <Textarea id="n-body" name="body" rows={3} maxLength={5000} required />
            <Button type="submit" size="sm">Add note</Button>
          </form>
          <ul className="divide-y text-sm">
            {(rows ?? []).map((n) => (
              <li key={n.id} className="py-3 space-y-1">
                <p className="whitespace-pre-wrap break-words">{n.pinned && <strong>Pinned · </strong>}{n.body}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{n.author_email} · {n.created_at.slice(0, 16).replace("T", " ")}</span>
                  <form action={notes}>{hidden(n.pinned ? "unpin" : "pin", { note: n.id })}<button type="submit" className="underline">{n.pinned ? "Unpin" : "Pin"}</button></form>
                  <form action={notes}>{hidden("delete", { note: n.id })}<button type="submit" className="underline text-destructive">Delete</button></form>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-lg">Tags</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t} className="flex items-center gap-1 rounded-full border px-2 py-0.5">
                {t}
                <form action={notes}>{hidden("tag_remove", { tag: t })}<button type="submit" aria-label={`Remove tag ${t}`} className="px-1">×</button></form>
              </li>
            ))}
          </ul>
          <form action={notes} className="flex gap-2">
            {hidden("tag_add")}
            <label htmlFor="t-new" className="sr-only">New tag</label>
            <Input id="t-new" name="tag" placeholder="e.g. vip, at risk" maxLength={30} />
            <Button type="submit" size="sm" variant="outline">Add</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

async function FeaturesTab({ uid, canEdit }: { uid: string; canEdit: boolean }) {
  const { data: targets } = await createServiceClient()
    .from("feature_targets")
    .select("feature_key, enabled")
    .eq("scope", "user")
    .eq("scope_value", uid)
  const current = new Map((targets ?? []).map((t) => [t.feature_key, t.enabled]))
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Features for this person</CardTitle></CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          &quot;Default&quot; follows the settings on <Link href="/admin/features" className="underline">Feature switches</Link>. A kill switch there overrides everything.
        </p>
        <ul className="divide-y text-sm">
          {(Object.keys(FEATURES) as (keyof typeof FEATURES)[]).map((key) => {
            const v = current.has(key) ? (current.get(key) ? "on" : "off") : "default"
            return (
              <li key={key} className="py-2 flex flex-wrap items-center justify-between gap-2">
                <span>{FEATURES[key]}</span>
                {canEdit ? (
                  <form action={featureOverride} className="flex gap-2">
                    <input type="hidden" name="uid" value={uid} />
                    <input type="hidden" name="key" value={key} />
                    <label htmlFor={`fo-${key}`} className="sr-only">{FEATURES[key]}</label>
                    <select id={`fo-${key}`} name="value" defaultValue={v} className={fieldClass}>
                      <option value="default">Default</option>
                      <option value="on">On for this person</option>
                      <option value="off">Off for this person</option>
                    </select>
                    <Button type="submit" size="sm" variant="outline">Save</Button>
                  </form>
                ) : (
                  <span className="text-muted-foreground">{v}</span>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
