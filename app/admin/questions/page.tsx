import Link from "next/link"
import { revalidatePath } from "next/cache"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createServiceClient } from "@/lib/supabase/service"
import { requireStaff, staffForAction } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import { notifyAnswered } from "@/lib/expert-queue"

export const dynamic = "force-dynamic"
export const metadata = { title: "Questions for an expert | ANDA", robots: { index: false } }

// Reply to a question. The reply goes to the person who asked; ticking "add to reviewed
// answers" also saves it as a draft, which someone else must approve before anyone else sees it.
async function answer(formData: FormData) {
  "use server"
  const staff = await staffForAction("answers.write")
  if (!staff) return
  const id = String(formData.get("id") ?? "")
  const reply = String(formData.get("answer") ?? "").trim()
  if (reply.length < 20 || reply.length > 4000) return
  const db = createServiceClient()
  const { data: q } = await db.from("expert_questions").select("id, user_id, question, channel").eq("id", id).eq("status", "open").maybeSingle()
  if (!q) return

  let reviewedId: string | null = null
  if (formData.get("save_draft") === "on") {
    const { data: draft } = await db
      .from("reviewed_answers")
      .insert({
        question: String(formData.get("library_question") || q.question).trim().slice(0, 300),
        answer: reply,
        sources: String(formData.get("sources") ?? "").trim().slice(0, 1000),
        written_by: staff.email,
      })
      .select("id")
      .single()
    reviewedId = draft?.id ?? null
  }
  const { error } = await db
    .from("expert_questions")
    .update({ status: "answered", answer: reply, answered_by: staff.email, answered_at: new Date().toISOString(), reviewed_answer_id: reviewedId })
    .eq("id", id)
    .eq("status", "open")
  if (error) return
  await logAdminAction(staff, "questions.answer", { type: "expert_questions", id, before: { status: "open" }, after: { status: "answered", reviewed_answer_id: reviewedId } })
  await notifyAnswered(q, reply)
  revalidatePath("/admin/questions")
}

async function close(formData: FormData) {
  "use server"
  const staff = await staffForAction("answers.write")
  if (!staff) return
  const id = String(formData.get("id") ?? "")
  const { error } = await createServiceClient().from("expert_questions").update({ status: "closed", answered_by: staff.email, answered_at: new Date().toISOString() }).eq("id", id).eq("status", "open")
  if (error) return
  await logAdminAction(staff, "questions.close", { type: "expert_questions", id, before: { status: "open" }, after: { status: "closed" } })
  revalidatePath("/admin/questions")
}

export default async function QuestionsPage() {
  await requireStaff("answers.write")
  const { data } = await createServiceClient()
    .from("expert_questions")
    .select("id, question, channel, crisis, created_at")
    .eq("status", "open")
    .order("crisis", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(100)
  const open = data ?? []

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 max-w-4xl">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Questions for an expert</h1>
          <p className="text-muted-foreground">
            {open.length} waiting, safety matches first. Reply in plain language, don&apos;t diagnose, and point to local
            professionals where needed. The person is emailed that a reply is waiting. A question asked on Telegram gets your reply there in full.
          </p>
          <p className="flex gap-4">
            <Link href="/admin" className="text-primary underline">
              Admin dashboard
            </Link>
            <Link href="/admin/answers" className="text-primary underline">
              Reviewed answers
            </Link>
          </p>
        </header>

        {open.length === 0 ? (
          <p className="text-muted-foreground">Nothing waiting.</p>
        ) : (
          <ul className="space-y-6">
            {open.map((q) => (
              <li key={q.id} className="rounded-lg border p-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {q.crisis && <Badge variant="destructive">Safety words matched: they were shown crisis lines</Badge>}
                  <Badge variant="outline">{q.channel}</Badge>
                  <span>Received {new Date(q.created_at).toLocaleString("en-GB")}</span>
                </div>
                <p className="whitespace-pre-wrap font-medium">{q.question}</p>
                <form action={answer} className="space-y-3">
                  <input type="hidden" name="id" value={q.id} />
                  <label className="block space-y-1 text-sm">
                    <span className="font-medium">Reply</span>
                    <textarea name="answer" required minLength={20} maxLength={4000} rows={6} className="w-full px-3 py-2 border rounded-lg bg-background" />
                  </label>
                  <details className="text-sm space-y-2">
                    <summary className="cursor-pointer">Also add to the reviewed answers</summary>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="save_draft" className="h-4 w-4" /> Save this reply as a draft reviewed answer
                    </label>
                    <label className="block space-y-1">
                      <span>Question as others would ask it (no personal details)</span>
                      <input name="library_question" maxLength={300} className="w-full px-3 py-2 border rounded-lg bg-background" />
                    </label>
                    <label className="block space-y-1">
                      <span>Sources</span>
                      <input name="sources" maxLength={1000} className="w-full px-3 py-2 border rounded-lg bg-background" />
                    </label>
                  </details>
                  <div className="flex gap-3">
                    <Button type="submit" size="sm">
                      Send reply
                    </Button>
                  </div>
                </form>
                <form action={close}>
                  <input type="hidden" name="id" value={q.id} />
                  <Button type="submit" size="sm" variant="outline">
                    Close without a reply
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
