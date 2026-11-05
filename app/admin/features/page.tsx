import { redirect } from "next/navigation"
import { AdminPage, fieldClass } from "@/components/admin/admin-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createServiceClient } from "@/lib/supabase/service"
import { requireStaff, staffForAction } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import { FEATURES, clearFeatureCache, isFeatureKey, type FeatureKey } from "@/lib/features"
import { TIER_RANK } from "@/lib/entitlements"

export const dynamic = "force-dynamic"
export const metadata = { title: "Feature switches | ANDA admin", robots: { index: false } }

const back = (msg: string) => redirect(`/admin/features?msg=${encodeURIComponent(msg)}`)
const SCOPES = { plan: "Plan", organization: "Organisation ID", user: "Account ID" } as const

async function saveControl(formData: FormData) {
  "use server"
  const staff = await staffForAction("features.edit")
  const key = String(formData.get("key") ?? "")
  if (!staff || !isFeatureKey(key)) return
  const db = createServiceClient()
  const { data: before } = await db.from("feature_controls").select("enabled, killed, rollout_percent").eq("key", key).maybeSingle()
  const op = String(formData.get("op") ?? "save")
  const pct = Math.min(100, Math.max(0, Math.round(Number(formData.get("rollout") ?? 100)) || 0))
  const next =
    op === "kill"
      ? { ...(before ?? { enabled: true, rollout_percent: 100 }), killed: true }
      : op === "unkill"
        ? { ...(before ?? { enabled: true, rollout_percent: 100 }), killed: false }
        : { enabled: formData.get("enabled") === "on", killed: before?.killed ?? false, rollout_percent: pct }
  const { error } = await db
    .from("feature_controls")
    .upsert({ key, description: FEATURES[key], ...next, updated_by: staff.email, updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) back(error.message)
  clearFeatureCache(key)
  await logAdminAction(staff, op === "kill" ? "features.kill" : op === "unkill" ? "features.unkill" : "features.update", {
    type: "feature",
    id: key,
    before: before ?? null,
    after: next,
  })
  back(`${FEATURES[key]}: saved.`)
}

async function saveTarget(formData: FormData) {
  "use server"
  const staff = await staffForAction("features.edit")
  const key = String(formData.get("key") ?? "")
  const scope = String(formData.get("scope") ?? "")
  const value = String(formData.get("value") ?? "").trim().toLowerCase()
  const state = String(formData.get("state") ?? "")
  if (!staff || !isFeatureKey(key) || !(scope in SCOPES) || !value || value.length > 100) return
  if (scope === "plan" && !(value in TIER_RANK)) back(`Plans are: ${Object.keys(TIER_RANK).join(", ")}.`)
  const db = createServiceClient()
  await db.from("feature_controls").upsert({ key, description: FEATURES[key], updated_by: staff.email }, { onConflict: "key", ignoreDuplicates: true })
  const { error } =
    state === "remove"
      ? await db.from("feature_targets").delete().eq("feature_key", key).eq("scope", scope).eq("scope_value", value)
      : await db
          .from("feature_targets")
          .upsert(
            { feature_key: key, scope, scope_value: value, enabled: state === "on", updated_by: staff.email, updated_at: new Date().toISOString() },
            { onConflict: "feature_key,scope,scope_value" },
          )
  if (error) back(error.message)
  clearFeatureCache(key)
  await logAdminAction(staff, "features.target", { type: "feature", id: key, after: { scope, value, state } })
  back(`${FEATURES[key]}: ${SCOPES[scope as keyof typeof SCOPES].toLowerCase()} ${value} ${state === "remove" ? "removed" : `set ${state}`}.`)
}

export default async function FeaturesPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireStaff("features.edit")
  const { msg } = await searchParams
  const db = createServiceClient()
  const [{ data: controls }, { data: targets }] = await Promise.all([
    db.from("feature_controls").select("key, enabled, killed, rollout_percent, updated_by, updated_at"),
    db.from("feature_targets").select("feature_key, scope, scope_value, enabled").order("scope"),
  ])
  const byKey = new Map((controls ?? []).map((c) => [c.key, c]))

  return (
    <AdminPage
      title="Feature switches"
      message={msg}
      intro={
        <p>
          Turn features on or off for everyone, a plan, an organisation or one person. The most specific setting wins
          (person, then organisation, then plan, then everyone); the kill switch beats them all. Changes reach every
          server within 30 seconds.
        </p>
      }
    >
      {(Object.keys(FEATURES) as FeatureKey[]).map((key) => {
        const c = byKey.get(key)
        const t = (targets ?? []).filter((x) => x.feature_key === key)
        return (
          <Card key={key} className={c?.killed ? "border-destructive" : ""}>
            <CardHeader>
              <CardTitle className="text-lg">
                {FEATURES[key]} {c?.killed && <span className="text-destructive">· killed</span>}
              </CardTitle>
              <CardDescription>
                <code>{key}</code> · {c ? `last changed by ${c.updated_by} on ${c.updated_at.slice(0, 10)}` : "never changed (on for everyone)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-4 items-end">
                <form action={saveControl} className="flex flex-wrap gap-3 items-end">
                  <input type="hidden" name="key" value={key} />
                  <label htmlFor={`en-${key}`} className="flex items-center gap-2">
                    <input id={`en-${key}`} type="checkbox" name="enabled" defaultChecked={c?.enabled ?? true} className="h-4 w-4" />
                    On for everyone else
                  </label>
                  <label htmlFor={`ro-${key}`} className="space-y-1">
                    <span className="block">Rollout %</span>
                    <Input id={`ro-${key}`} name="rollout" type="number" min={0} max={100} defaultValue={c?.rollout_percent ?? 100} className="w-24" />
                  </label>
                  <Button type="submit" size="sm">Save</Button>
                </form>
                <form action={saveControl}>
                  <input type="hidden" name="key" value={key} />
                  <input type="hidden" name="op" value={c?.killed ? "unkill" : "kill"} />
                  <Button type="submit" size="sm" variant={c?.killed ? "outline" : "destructive"}>
                    {c?.killed ? "Undo kill switch" : "Kill switch: off for everyone now"}
                  </Button>
                </form>
              </div>

              {t.length > 0 && (
                <ul className="divide-y rounded-md border">
                  {t.map((x) => (
                    <li key={`${x.scope}:${x.scope_value}`} className="p-2 flex flex-wrap justify-between gap-2">
                      <span>{SCOPES[x.scope as keyof typeof SCOPES]} <code className="break-all">{x.scope_value}</code>: <strong>{x.enabled ? "on" : "off"}</strong></span>
                      <form action={saveTarget}>
                        <input type="hidden" name="key" value={key} />
                        <input type="hidden" name="scope" value={x.scope} />
                        <input type="hidden" name="value" value={x.scope_value} />
                        <input type="hidden" name="state" value="remove" />
                        <button type="submit" className="underline">Remove</button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}

              <form action={saveTarget} className="flex flex-wrap gap-2 items-end">
                <input type="hidden" name="key" value={key} />
                <label htmlFor={`sc-${key}`} className="space-y-1"><span className="block">For</span>
                  <select id={`sc-${key}`} name="scope" className={fieldClass} defaultValue="plan">
                    {Object.entries(SCOPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </label>
                <label htmlFor={`va-${key}`} className="space-y-1"><span className="block">Value</span>
                  <Input id={`va-${key}`} name="value" required className="w-72" placeholder="e.g. pro, or an ID" />
                </label>
                <label htmlFor={`st-${key}`} className="space-y-1"><span className="block">Set</span>
                  <select id={`st-${key}`} name="state" className={fieldClass} defaultValue="on">
                    <option value="on">On</option>
                    <option value="off">Off</option>
                  </select>
                </label>
                <Button type="submit" size="sm" variant="outline">Add rule</Button>
              </form>
            </CardContent>
          </Card>
        )
      })}
    </AdminPage>
  )
}
