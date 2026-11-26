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
  const staff = await staffForAction("clinical.approve")
  if (!staff) return
  const id = text(formData, "id", 36)
  const now = new Date()
  // The database also refuses an approval by the author (reviewed_answers_two_person).
  const { data, error } = await createServiceClient()
    .from("reviewed_answers")
    .update({ status: "approved", approved_by: staff.email, approved_at: now.toISOString(), review_due: reviewDueDate(now) })
    .eq("id", id)
    .eq("status", "draft")
    .neq("written_by", staff.email)
    .select("id")
  if (error || !data?.length) return
  await logAdminAction(staff, "answers.approve", { type: "reviewed_answers", id, before: { status: "draft" }, after: { status: "approved" } })
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
    .select("id, question, other_phrasings, answer, sources, lang, status, written_by, approved_by, review_due, helpful, not_helpful")
    .order("status")
    .order("updated_at", { ascending: false })
    .limit(500)
  const rows = (data ?? []) as Row[]
  const today = new Date().toISOString().slice(0, 10)
  const mayApprove = can(staff.role, "clinical.approve")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 max-w-4xl">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Reviewed answers</h1>
          <p className="text-muted-foreground">
            The only answers /ask, the companion and Telegram give. Someone other than the writer approves each one, and
            approved answers are re-checked after a year. Base answers on sources you can name; no diagnosis or medication
            advice.
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
                {r.status !== "retired" && (
                  <form action={retire}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Retire
                    </Button>
                  </form>
                )}
              </div>
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
