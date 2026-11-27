import Link from "next/link"
import { revalidatePath } from "next/cache"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createServiceClient } from "@/lib/supabase/service"
import { requireStaff, staffForAction } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import { can } from "@/lib/admin/permissions"
import { reviewDueDate } from "@/lib/reviewed-answers"
import { AFRICAN_COUNTRIES, countryName } from "@/lib/country"

const isCountryCode = (c: string) => c in AFRICAN_COUNTRIES

export const dynamic = "force-dynamic"
export const metadata = { title: "Reviewed answers | ANDA", robots: { index: false } }

interface Row {
  id: string
  question: string
  other_phrasings: string
  answer: string
  sources: string
  lang: string
  status: "draft" | "approved" | "retired"
  review_level: "evidence" | "clinical"
  clinical_reviewer: string | null
  written_by: string
  approved_by: string | null
  review_due: string | null
  helpful: number
  not_helpful: number
}

const text = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max)

// Save a draft. Changing an approved answer puts it back to draft, so a second person checks the change.
async function save(formData: FormData) {
  "use server"
  const staff = await staffForAction("answers.write")
  if (!staff) return
  const id = text(formData, "id", 36)
  const lang = ["en", "fr", "pt"].includes(text(formData, "lang", 2)) ? text(formData, "lang", 2) : "en"
  const fields = {
    question: text(formData, "question", 300),
    other_phrasings: text(formData, "other_phrasings", 2000),
    answer: text(formData, "answer", 4000),
    sources: text(formData, "sources", 1000),
    lang,
    status: "draft",
    written_by: staff.email,
    approved_by: null,
    approved_at: null,
    review_level: "evidence",
    clinical_reviewer: null,
    clinical_reviewed_at: null,
    updated_at: new Date().toISOString(),
  }
  if (fields.question.length < 5 || fields.answer.length < 20) return
  const db = createServiceClient()
  const { data, error } = id
    ? await db.from("reviewed_answers").update(fields).eq("id", id).select("id").single()
    : await db.from("reviewed_answers").insert(fields).select("id").single()
  if (error || !data) return
  await logAdminAction(staff, id ? "answers.edit" : "answers.create", { type: "reviewed_answers", id: data.id, after: { status: "draft", question: fields.question } })
  revalidatePath("/admin/answers")
}

async function approve(formData: FormData) {
  "use server"
  const staff = await staffForAction("answers.approve")
  if (!staff) return
  const id = text(formData, "id", 36)
  const now = new Date()
  // A clinician approving a draft confirms it clinically in the same step.
  const clinical = can(staff.role, "clinical.approve")
  // The database also refuses an approval by the author (reviewed_answers_two_person).
  const { data, error } = await createServiceClient()
    .from("reviewed_answers")
    .update({
      status: "approved",
      approved_by: staff.email,
      approved_at: now.toISOString(),
      review_due: reviewDueDate(now),
      ...(clinical ? { review_level: "clinical", clinical_reviewer: staff.email, clinical_reviewed_at: now.toISOString() } : {}),
    })
    .eq("id", id)
    .eq("status", "draft")
    .neq("written_by", staff.email)
    .select("id")
  if (error || !data?.length) return
  await logAdminAction(staff, "answers.approve", { type: "reviewed_answers", id, before: { status: "draft" }, after: { status: "approved", clinical } })
  revalidatePath("/admin/answers")
}

// A clinician confirms an answer that was approved against its sources.
async function confirmClinical(formData: FormData) {
  "use server"
  const staff = await staffForAction("clinical.approve")
  if (!staff) return
  const id = text(formData, "id", 36)
  const { data, error } = await createServiceClient()
    .from("reviewed_answers")
    .update({ review_level: "clinical", clinical_reviewer: staff.email, clinical_reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "approved")
    .eq("review_level", "evidence")
    .select("id")
  if (error || !data?.length) return
  await logAdminAction(staff, "answers.clinical_confirm", { type: "reviewed_answers", id, before: { review_level: "evidence" }, after: { review_level: "clinical" } })
  revalidatePath("/admin/answers")
}

async function retire(formData: FormData) {
  "use server"
  const staff = await staffForAction("answers.write")
  if (!staff) return
  const id = text(formData, "id", 36)
  const { error } = await createServiceClient().from("reviewed_answers").update({ status: "retired", updated_at: new Date().toISOString() }).eq("id", id)
  if (error) return
  await logAdminAction(staff, "answers.retire", { type: "reviewed_answers", id, after: { status: "retired" } })
  revalidatePath("/admin/answers")
}

// ---- Local context notes (scripts/064): Africa-wide or per-country, same two-person rule ----

interface ContextRow {
  id: string
  answer_id: string
  scope: string
  kind: "myth" | "local"
  note: string
  sources: string
  status: "draft" | "approved" | "retired"
  written_by: string
  approved_by: string | null
}

async function saveContext(formData: FormData) {
  "use server"
  const staff = await staffForAction("answers.write")
  if (!staff) return
  const rawScope = text(formData, "scope", 10)
  const scope = rawScope.toLowerCase() === "africa" ? "africa" : rawScope.toUpperCase()
  const kind = text(formData, "kind", 5) === "local" ? "local" : "myth"
  const fields = {
    answer_id: text(formData, "answer_id", 36),
    scope,
    kind,
    note: text(formData, "note", 1500),
    sources: text(formData, "sources", 1000),
    status: "draft",
    written_by: staff.email,
    approved_by: null,
    approved_at: null,
    updated_at: new Date().toISOString(),
  }
  if (fields.note.length < 20 || !(scope === "africa" || isCountryCode(scope))) return
  // One note per answer, place and kind: saving again replaces it and puts it back to draft.
  const { data, error } = await createServiceClient()
    .from("reviewed_answer_context")
    .upsert(fields, { onConflict: "answer_id,scope,kind" })
    .select("id")
    .single()
  if (error || !data) return
  await logAdminAction(staff, "answers.context_save", { type: "reviewed_answer_context", id: data.id, after: { scope, kind, status: "draft" } })
  revalidatePath("/admin/answers")
}

async function approveContext(formData: FormData) {
  "use server"
  const staff = await staffForAction("answers.approve")
  if (!staff) return
  const id = text(formData, "id", 36)
  const { data, error } = await createServiceClient()
    .from("reviewed_answer_context")
    .update({ status: "approved", approved_by: staff.email, approved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "draft")
    .neq("written_by", staff.email)
    .select("id")
  if (error || !data?.length) return
  await logAdminAction(staff, "answers.context_approve", { type: "reviewed_answer_context", id, after: { status: "approved" } })
  revalidatePath("/admin/answers")
}

async function retireContext(formData: FormData) {
  "use server"
  const staff = await staffForAction("answers.write")
  if (!staff) return
  const id = text(formData, "id", 36)
  const { error } = await createServiceClient()
    .from("reviewed_answer_context")
    .update({ status: "retired", updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return
  await logAdminAction(staff, "answers.context_retire", { type: "reviewed_answer_context", id, after: { status: "retired" } })
  revalidatePath("/admin/answers")
}

const input = "w-full px-3 py-2 border rounded-lg bg-background"

function AnswerForm({ row }: { row?: Row }) {
  return (
    <form action={save} className="space-y-3 text-sm">
      {row && <input type="hidden" name="id" value={row.id} />}
      <label className="block space-y-1">
        <span className="font-medium">Question</span>
        <input name="question" required minLength={5} maxLength={300} defaultValue={row?.question} className={input} />
      </label>
      <label className="block space-y-1">
        <span className="font-medium">Other ways people ask it (one per line)</span>
        <textarea name="other_phrasings" maxLength={2000} rows={3} defaultValue={row?.other_phrasings} className={input} />
      </label>
      <label className="block space-y-1">
        <span className="font-medium">Answer</span>
        <textarea name="answer" required minLength={20} maxLength={4000} rows={8} defaultValue={row?.answer} className={input} />
      </label>
      <label className="block space-y-1">
        <span className="font-medium">Sources</span>
        <input name="sources" maxLength={1000} defaultValue={row?.sources} className={input} />
      </label>
      <label className="block space-y-1">
        <span className="font-medium">Language</span>
        <select name="lang" defaultValue={row?.lang ?? "en"} className={input}>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="pt">Portuguese</option>
        </select>
      </label>
      <Button type="submit" size="sm">
        {row ? "Save changes as a draft" : "Save draft"}
      </Button>
    </form>
  )
}

export default async function AnswersPage() {
  const staff = await requireStaff("answers.write")
  const { data } = await createServiceClient()
    .from("reviewed_answers")
    .select("id, question, other_phrasings, answer, sources, lang, status, review_level, clinical_reviewer, written_by, approved_by, review_due, helpful, not_helpful")
    .order("status")
    .order("updated_at", { ascending: false })
    .limit(500)
  const rows = (data ?? []) as Row[]
  const { data: contextData } = await createServiceClient()
    .from("reviewed_answer_context")
    .select("id, answer_id, scope, kind, note, sources, status, written_by, approved_by")
    .neq("status", "retired")
    .order("scope")
  const contextFor = (answerId: string) => ((contextData ?? []) as ContextRow[]).filter((c) => c.answer_id === answerId)
  const today = new Date().toISOString().slice(0, 10)
  const mayApprove = can(staff.role, "answers.approve")
  const isClinician = can(staff.role, "clinical.approve")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 max-w-4xl">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Reviewed answers</h1>
          <p className="text-muted-foreground">
            The only answers /ask, the companion and Telegram give. Someone other than the writer approves each one after
            checking it against the sources it names, and approved answers are re-checked after a year. Until a clinician
            confirms an answer, it is shown as &quot;not yet reviewed by a clinician&quot;. No diagnosis, dosing or
            medication advice.
          </p>
          <p className="flex gap-4">
            <Link href="/admin" className="text-primary underline">
              Admin dashboard
            </Link>
            <Link href="/admin/questions" className="text-primary underline">
              Questions for an expert
            </Link>
          </p>
        </header>

        <details className="rounded-lg border p-5">
          <summary className="cursor-pointer font-semibold">Write a new answer</summary>
          <div className="pt-4">
            <AnswerForm />
          </div>
        </details>

        <ul className="space-y-6">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant={r.status === "approved" ? "default" : "outline"}>{r.status}</Badge>
                <Badge variant="secondary">{r.lang}</Badge>
                {r.status === "approved" && (
                  <Badge variant="outline">{r.review_level === "clinical" ? `clinician: ${r.clinical_reviewer}` : "not yet clinician-reviewed"}</Badge>
                )}
                {r.status === "approved" && r.review_due && r.review_due < today && <Badge variant="destructive">Re-check due</Badge>}
                <span className="text-muted-foreground">
                  Written by {r.written_by}
                  {r.approved_by && `, approved by ${r.approved_by}`} · helped {r.helpful}, didn&apos;t help {r.not_helpful}
                </span>
              </div>
              <h2 className="text-lg font-semibold">{r.question}</h2>
              <p className="whitespace-pre-wrap text-sm">{r.answer}</p>
              {r.sources && <p className="text-xs text-muted-foreground">Sources: {r.sources}</p>}
              <div className="flex flex-wrap gap-3">
                {r.status === "draft" && mayApprove && r.written_by.toLowerCase() !== staff.email.toLowerCase() && (
                  <form action={approve}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                )}
                {r.status === "approved" && r.review_level === "evidence" && isClinician && (
                  <form action={confirmClinical}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" size="sm">
                      Confirm as clinician
                    </Button>
                  </form>
                )}
                {r.status !== "retired" && (
                  <form action={retire}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Retire
                    </Button>
                  </form>
                )}
              </div>
              {contextFor(r.id).map((c) => (
                <div key={c.id} className="rounded-lg bg-secondary p-3 text-sm space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant={c.status === "approved" ? "default" : "outline"}>{c.status}</Badge>
                    <Badge variant="secondary">{c.scope === "africa" ? "All of Africa" : (countryName(c.scope) ?? c.scope)}</Badge>
                    <Badge variant="secondary">{c.kind === "myth" ? "What people often hear" : "Where you live"}</Badge>
                    <span className="text-muted-foreground">
                      Written by {c.written_by}
                      {c.approved_by ? `, approved by ${c.approved_by}` : ""}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{c.note}</p>
                  {c.sources && <p className="text-xs text-muted-foreground">Sources: {c.sources}</p>}
                  <div className="flex gap-3">
                    {c.status === "draft" && mayApprove && c.written_by.toLowerCase() !== staff.email.toLowerCase() && (
                      <form action={approveContext}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button type="submit" size="sm">
                          Approve note
                        </Button>
                      </form>
                    )}
                    <form action={retireContext}>
                      <input type="hidden" name="id" value={c.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Retire note
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
              <details className="text-sm">
                <summary className="cursor-pointer">Add or replace a local context note</summary>
                <form action={saveContext} className="space-y-3 pt-3">
                  <input type="hidden" name="answer_id" value={r.id} />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="block space-y-1">
                      <span className="font-medium">Where it applies</span>
                      <select name="scope" defaultValue="africa" className={input}>
                        <option value="africa">All of Africa</option>
                        {Object.entries(AFRICAN_COUNTRIES)
                          .sort((a, b) => a[1].localeCompare(b[1]))
                          .map(([code, name]) => (
                            <option key={code} value={code}>
                              {name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="block space-y-1">
                      <span className="font-medium">Kind</span>
                      <select name="kind" defaultValue="myth" className={input}>
                        <option value="myth">What people often hear (a belief to correct)</option>
                        <option value="local">Where you live (laws, services, next steps)</option>
                      </select>
                    </label>
                  </div>
                  <label className="block space-y-1">
                    <span className="font-medium">Note (respectful: correct the belief, not the person)</span>
                    <textarea name="note" required minLength={20} maxLength={1500} rows={4} className={input} />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-medium">Sources</span>
                    <input name="sources" maxLength={1000} className={input} />
                  </label>
                  <Button type="submit" size="sm">
                    Save note as a draft
                  </Button>
                </form>
              </details>
              <details className="text-sm">
                <summary className="cursor-pointer">Edit</summary>
                <div className="pt-3">
                  <AnswerForm row={r} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
