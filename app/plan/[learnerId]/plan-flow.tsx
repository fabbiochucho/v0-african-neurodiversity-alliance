"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataKindBadge } from "@/components/data-kind-badge"
import { SUPPORT_PROFILE_FIELDS } from "@/lib/learner-records"
import { GOAL_FIELDS, PLAN_SECTIONS, PLAN_STEPS, stepIsKnown, type PlanFacts, type PlanStepKey } from "@/lib/iep-plan"
import type { LoadedPlan, PlanGoal, PlanItem } from "@/lib/plan-data"

const field = "w-full px-3 py-2 border rounded-lg bg-background"
const sectionLabel = (key: string) => PLAN_SECTIONS.find((s) => s.key === key)?.label ?? key
const isPending = (status: string) => status === "draft" || status === "suggested"

interface Ctx {
  plan: LoadedPlan
  busy: boolean
  act: (fn: () => Promise<unknown>, ok: string) => Promise<void>
  selected: Set<string>
  toggle: (id: string, on: boolean) => void
  next: () => void
}

async function call(url: string, method: string, body: object) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || "Something didn't save. Your information is still here. Try again."), { data })
  return data
}

async function saveProfileField(plan: LoadedPlan, key: string, value: string) {
  const form = new FormData()
  form.set("record", "support_profile")
  form.set("learner_id", plan.learner.id)
  for (const f of SUPPORT_PROFILE_FIELDS) form.set(f.key, plan.profile?.[f.key] ?? "")
  form.set(key, value)
  const res = await fetch("/api/learner-records", { method: "POST", body: form })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Something didn't save. Try again.")
}

function SourceLabel({ source, status, edited }: { source: string; status: string; edited?: boolean }) {
  if (source === "ai") {
    return (
      <span className="inline-flex items-center gap-1">
        <DataKindBadge kind="ai_interpretation" />
        {edited && <span className="text-xs text-muted-foreground">edited by a person</span>}
      </span>
    )
  }
  return (
    <span className="rounded-full border px-2 py-0.5 text-xs">
      {source === "template" ? "From template" : status === "suggested" ? "Suggested by team" : "Written by a person"}
    </span>
  )
}

function SelectBox({ id, ctx }: { id: string; ctx: Ctx }) {
  return (
    <label className="ml-auto flex items-center gap-1">
      <input type="checkbox" checked={ctx.selected.has(id)} onChange={(e) => ctx.toggle(id, e.target.checked)} />
      Select
    </label>
  )
}

function ProfileStep({ k, ctx }: { k: "strengths" | "difficulties" | "what_helps" | "school_context"; ctx: Ctx }) {
  const { plan, busy, act, next } = ctx
  const meta = SUPPORT_PROFILE_FIELDS.find((f) => f.key === k)!
  const known = plan.profile?.[k]
  const [editing, setEditing] = useState(!known)
  const [value, setValue] = useState(known ?? "")
  const nr = plan.neurafiki.map((r) => (typeof r.fields?.summary === "string" ? r.fields.summary : null)).filter(Boolean)

  return (
    <div className="space-y-3 text-sm">
      {known && !editing ? (
        <>
          <p className="text-muted-foreground">We already know this from the support profile:</p>
          <p className="whitespace-pre-line rounded-lg border p-3">{known}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={next}>
              That&apos;s right, continue
            </Button>
            {plan.isOwner && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                Change it
              </Button>
            )}
          </div>
        </>
      ) : plan.isOwner ? (
        <>
          <p>{meta.hint}</p>
          <textarea rows={4} maxLength={2000} value={value} onChange={(e) => setValue(e.target.value)} className={field} />
          <Button size="sm" disabled={busy || !value.trim()} onClick={() => act(() => saveProfileField(plan, k, value), "Saved to the support profile.")}>
            Save
          </Button>
        </>
      ) : (
        <p className="text-muted-foreground">Not recorded yet. The learner&apos;s owner can add this.</p>
      )}
      {(k === "strengths" || k === "difficulties") && nr.length > 0 && (
        <div className="rounded-lg border p-3 space-y-1">
          <DataKindBadge kind="assessment" />
          {nr.map((s, i) => (
            <p key={i} className="text-muted-foreground">
              {s}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function GoalCard({ g, ctx }: { g: PlanGoal; ctx: Ctx }) {
  const { plan, busy, act } = ctx
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>(
    Object.fromEntries(GOAL_FIELDS.map((f) => [f.key, (g[f.key as keyof PlanGoal] as string | null) ?? ""])),
  )

  return (
    <div className="rounded-lg border p-3 space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <SourceLabel source={g.source} status={g.approval_status} />
        {isPending(g.approval_status) && plan.can.approve && <SelectBox id={g.id} ctx={ctx} />}
      </div>
      <p className="font-semibold">{g.goal_text}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {GOAL_FIELDS.slice(1).map((f) => (
          <div key={f.key}>
            <dt className="text-muted-foreground">{f.label}</dt>
            <dd>{(g[f.key as keyof PlanGoal] as string | null) || "Not set yet"}</dd>
          </div>
        ))}
      </dl>
      {plan.can.manage && (
        <>
          <Button size="sm" variant="ghost" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Edit"}
          </Button>
          {open && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GOAL_FIELDS.map((f) => (
                <label key={f.key} className="space-y-1">
                  <span className="font-medium">{f.label}</span>
                  <input
                    type={f.key === "review_date" ? "date" : "text"}
                    value={draft[f.key]}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    className={field}
                  />
                </label>
              ))}
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  act(() => call(`/api/iep/goals/${g.id}`, "PUT", Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, v || null]))), "Goal saved.")
                }
              >
                Save goal
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ItemRow({ item, ctx }: { item: PlanItem; ctx: Ctx }) {
  const { plan, busy, act } = ctx
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(item.content)

  return (
    <li className="rounded-lg border p-3 text-sm space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{sectionLabel(item.section)}</span>
        <SourceLabel source={item.source} status={item.status} edited={item.edited} />
        {isPending(item.status) && plan.can.approve && <SelectBox id={item.id} ctx={ctx} />}
      </div>
      {editing ? (
        <>
          <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} className={field} />
          <Button
            size="sm"
            disabled={busy}
            onClick={() => act(() => call("/api/plan/items", "PATCH", { id: item.id, content: value, learner_id: plan.learner.id }), "Draft updated.")}
          >
            Save
          </Button>
        </>
      ) : (
        <p className="whitespace-pre-line">{item.content}</p>
      )}
      {isPending(item.status) && plan.can.manage && !editing && (
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          Edit
        </Button>
      )}
    </li>
  )
}

function AddContent({ ctx }: { ctx: Ctx }) {
  const { plan, busy, act } = ctx
  const [kind, setKind] = useState<"goal" | "item">("goal")
  const [section, setSection] = useState<string>(PLAN_SECTIONS[0].key)
  const [values, setValues] = useState<Record<string, string>>({})
  if (!plan.iep || !(plan.can.manage || plan.can.suggest)) return null
  const iepId = plan.iep.id

  return (
    <details className="rounded-lg border p-3 text-sm">
      <summary className="cursor-pointer font-medium">{plan.can.manage ? "Add a goal or strategy" : "Suggest a goal or strategy"}</summary>
      <div className="mt-3 space-y-2">
        <select value={kind} onChange={(e) => setKind(e.target.value as "goal" | "item")} className={field} aria-label="What to add">
          <option value="goal">A goal</option>
          <option value="item">A plan strategy, accommodation or support</option>
        </select>
        {kind === "item" ? (
          <>
            <select value={section} onChange={(e) => setSection(e.target.value)} className={field} aria-label="Plan section">
              {PLAN_SECTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <textarea
              rows={3}
              aria-label="Content"
              value={values.content ?? ""}
              onChange={(e) => setValues({ ...values, content: e.target.value })}
              className={field}
            />
          </>
        ) : (
          GOAL_FIELDS.filter((f) => f.key !== "evidence").map((f) => (
            <label key={f.key} className="block space-y-1">
              <span>{f.label}</span>
              <input
                type={f.key === "review_date" ? "date" : "text"}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                className={field}
              />
            </label>
          ))
        )}
        <Button
          size="sm"
          disabled={busy}
          onClick={() =>
            act(
              () => call("/api/plan/items", "POST", { kind, iep_id: iepId, learner_id: plan.learner.id, section, ...values }),
              plan.can.manage ? "Added as a draft for approval." : "Suggestion sent for approval.",
            ).then(() => setValues({}))
          }
        >
          Add
        </Button>
      </div>
    </details>
  )
}

export function PlanFlow({
  plan,
  facts,
  startAt,
  planLabel,
  disclaimer,
  ai,
}: {
  plan: LoadedPlan
  facts: PlanFacts
  startAt: PlanStepKey
  ai: { configured: boolean; entitled: boolean; consented: boolean }
  planLabel: string
  disclaimer: string
}) {
  const router = useRouter()
  const [step, setStep] = useState<PlanStepKey>(startAt)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string; href?: string } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const index = PLAN_STEPS.findIndex((s) => s.key === step)
  const name = plan.learner.name.trim().split(/\s+/)[0]

  async function act(fn: () => Promise<unknown>, ok: string) {
    setBusy(true)
    setMessage(null)
    try {
      await fn()
      setMessage({ ok: true, text: ok })
      router.refresh()
    } catch (err) {
      const e = err as Error & { data?: { error?: string; consent_url?: string } }
      if (e.data?.error === "consent_required") {
        setMessage({ ok: false, text: "AI drafting needs your consent to share this learner's details.", href: e.data.consent_url })
      } else setMessage({ ok: false, text: e.message })
    } finally {
      setBusy(false)
    }
  }

  const ctx: Ctx = {
    plan,
    busy,
    act,
    selected,
    toggle: (id, on) => {
      const nextSet = new Set(selected)
      if (on) nextSet.add(id)
      else nextSet.delete(id)
      setSelected(nextSet)
    },
    next: () => setStep(PLAN_STEPS[Math.min(index + 1, PLAN_STEPS.length - 1)].key),
  }

  const pendingGoals = plan.goals.filter((g) => isPending(g.approval_status))
  const pendingItems = plan.items.filter((i) => isPending(i.status))
  const approvedGoals = plan.goals.filter((g) => g.approval_status === "approved")
  const approvedItems = plan.items.filter((i) => i.status === "approved")

  function approve(reject: boolean) {
    if (!plan.iep) return
    const iepId = plan.iep.id
    act(
      () =>
        call("/api/plan/approve", "POST", {
          iep_id: iepId,
          learner_id: plan.learner.id,
          goal_ids: pendingGoals.filter((g) => selected.has(g.id)).map((g) => g.id),
          item_ids: pendingItems.filter((i) => selected.has(i.id)).map((i) => i.id),
          reject,
        }),
      reject ? "Not added to the plan." : "Approved. A new plan version was saved.",
    ).then(() => setSelected(new Set()))
  }

  const body: Record<PlanStepKey, React.ReactNode> = {
    about: (
      <div className="space-y-2 text-sm">
        <p>
          <strong>{plan.learner.name}</strong>
          {plan.learner.age != null ? `, ${plan.learner.age}` : ""}
          {plan.learner.country ? `, ${plan.learner.country}` : ""}
        </p>
        {!stepIsKnown("about", facts) && <p className="text-muted-foreground">Some details are missing; you can add them later.</p>}
        <Link href={`/journey/${plan.learner.id}/profile`} className="text-primary hover:underline">
          See the full support profile
        </Link>
      </div>
    ),
    strengths: <ProfileStep k="strengths" ctx={ctx} />,
    difficulties: <ProfileStep k="difficulties" ctx={ctx} />,
    what_helps: <ProfileStep k="what_helps" ctx={ctx} />,
    current_goals:
      approvedGoals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No goals in the plan yet. You&apos;ll draft some in &ldquo;Generate plan&rdquo;.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {approvedGoals.map((g) => (
            <li key={g.id} className="rounded-lg border p-3">
              {g.goal_text} <span className="text-muted-foreground">({g.status.replace("_", " ")})</span>
            </li>
          ))}
        </ul>
      ),
    school_context: <ProfileStep k="school_context" ctx={ctx} />,
    support_team: (
      <div className="space-y-2 text-sm">
        {plan.team.length === 0 ? (
          <p className="text-muted-foreground">No one else is on {name}&apos;s team yet.</p>
        ) : (
          <ul>
            {plan.team.map((m) => (
              <li key={m.id}>
                {m.invited_email} ({m.status})
              </li>
            ))}
          </ul>
        )}
        <Link href={`/journey/${plan.learner.id}#team-heading`} className="text-primary hover:underline">
          Manage the support team
        </Link>
      </div>
    ),
    generate: (
      <div className="space-y-4 text-sm">
        {!plan.iep && plan.isOwner && (
          <Button disabled={busy} onClick={() => act(() => call(`/api/plan/${plan.learner.id}`, "POST", { action: "start" }), "Plan started.")}>
            Start {name}&apos;s plan
          </Button>
        )}
        {plan.iep && plan.can.manage && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => act(() => call(`/api/plan/${plan.learner.id}`, "POST", { mode: "template" }), "Template goals added as drafts.")}
            >
              Draft goals from templates
            </Button>
            {ai.configured && ai.entitled && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => act(() => call(`/api/plan/${plan.learner.id}`, "POST", { mode: "ai" }), "AI drafts added. Review them before approving.")}
              >
                Draft with AI
              </Button>
            )}
          </div>
        )}
        <p className="text-muted-foreground">
          Drafts are labelled and never become part of the official plan until someone with approve rights approves them.
          {ai.configured && !ai.entitled && " AI drafting is available on Pro."}
          {ai.configured && ai.entitled && !ai.consented && " AI drafting needs your consent to share this learner's details first."}
        </p>
      </div>
    ),
    review: (
      <div className="space-y-4">
        {pendingGoals.length === 0 && pendingItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing waiting for review.</p>
        ) : (
          <>
            {pendingGoals.map((g) => (
              <GoalCard key={g.id} g={g} ctx={ctx} />
            ))}
            <ul className="space-y-2">
              {pendingItems.map((i) => (
                <ItemRow key={i.id} item={i} ctx={ctx} />
              ))}
            </ul>
          </>
        )}
        <AddContent ctx={ctx} />
      </div>
    ),
    approve: plan.can.approve ? (
      <div className="space-y-3 text-sm">
        <p>
          {selected.size} selected of {pendingGoals.length + pendingItems.length} waiting. Select items in Review, then:
        </p>
        <div className="flex gap-2">
          <Button disabled={busy || selected.size === 0 || !plan.iep} onClick={() => approve(false)}>
            Approve selected
          </Button>
          <Button variant="outline" disabled={busy || selected.size === 0 || !plan.iep} onClick={() => approve(true)}>
            Don&apos;t include
          </Button>
        </div>
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">Someone with approve rights (usually the parent or guardian) approves the plan.</p>
    ),
    track: (
      <div className="space-y-2 text-sm">
        <p>Check-ins on each approved goal build {name}&apos;s progress over time.</p>
        <Link href={`/journey/${plan.learner.id}#working-on`} className="text-primary hover:underline">
          Log check-ins on the journey page
        </Link>
      </div>
    ),
    review_update: (
      <div className="space-y-3 text-sm">
        {plan.versions.length === 0 ? (
          <p className="text-muted-foreground">No approved versions yet.</p>
        ) : (
          <ul>
            {plan.versions.map((v) => (
              <li key={v.id}>
                Version {v.version}, approved {new Date(v.approved_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
        {approvedGoals.some((g) => g.review_date) && (
          <p>
            Next review:{" "}
            {approvedGoals
              .map((g) => g.review_date)
              .filter(Boolean)
              .sort()[0]}
          </p>
        )}
        <Button variant="outline" size="sm" onClick={() => setStep("review")}>
          Start a review: add or change goals
        </Button>
      </div>
    ),
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8">
      <nav aria-label="Plan steps">
        <h1 className="text-2xl font-bold mb-4">
          {name}&apos;s {planLabel}
        </h1>
        <p className="mb-4 text-xs text-muted-foreground">{disclaimer}</p>
        <ol className="space-y-1 text-sm">
          {PLAN_STEPS.map((s, i) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => setStep(s.key)}
                aria-current={step === s.key ? "step" : undefined}
                className={`w-full text-left rounded-md px-2 py-1 ${step === s.key ? "bg-primary/10 font-semibold" : "hover:bg-accent"}`}
              >
                {i + 1}. {s.title}
                {stepIsKnown(s.key, facts) && <span className="text-muted-foreground"> · known</span>}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Step {index + 1} of 12</p>
            <CardTitle>{PLAN_STEPS[index].title}</CardTitle>
          </CardHeader>
          <CardContent>{body[step]}</CardContent>
        </Card>
        {message && (
          <p role={message.ok ? "status" : "alert"} className={`text-sm ${message.ok ? "text-primary" : "text-destructive"}`}>
            {message.text}{" "}
            {message.href && (
              <Link href={message.href} className="underline">
                Review consent
              </Link>
            )}
          </p>
        )}
        <div className="flex justify-between">
          <Button variant="outline" disabled={index === 0} onClick={() => setStep(PLAN_STEPS[index - 1].key)}>
            Back
          </Button>
          <Button disabled={index === PLAN_STEPS.length - 1} onClick={ctx.next}>
            Next
          </Button>
        </div>

        <section aria-labelledby="official-heading" className="space-y-3">
          <h2 id="official-heading" className="text-xl font-semibold">
            The official plan
          </h2>
          {approvedItems.length === 0 && approvedGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing approved yet.</p>
          ) : (
            <>
              {approvedGoals.length > 0 && (
                <div className="text-sm">
                  <h3 className="font-medium">Goals</h3>
                  <ul className="list-disc pl-5">
                    {approvedGoals.map((g) => (
                      <li key={g.id}>{g.goal_text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {PLAN_SECTIONS.filter((s) => approvedItems.some((i) => i.section === s.key)).map((s) => (
                <div key={s.key} className="text-sm">
                  <h3 className="font-medium">{s.label}</h3>
                  <ul className="list-disc pl-5">
                    {approvedItems
                      .filter((i) => i.section === s.key)
                      .map((i) => (
                        <li key={i.id}>{i.content}</li>
                      ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
