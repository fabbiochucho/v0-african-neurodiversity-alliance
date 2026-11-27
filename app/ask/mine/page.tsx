import Link from "next/link"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const metadata = { title: "Your questions | ANDA", robots: { index: false } }

const STATUS = { open: "Waiting for an expert", answered: "Answered", closed: "Closed" } as const

export default async function MyQuestionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/ask/mine")

  // RLS: only this person's own questions.
  const { data } = await supabase
    .from("expert_questions")
    .select("id, question, status, answer, answered_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50)
  const questions = data ?? []

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold">Your questions</h1>
            <p className="text-muted-foreground">
              Questions you sent to an ANDA expert, and their replies. Replies are general guidance, not a diagnosis or
              treatment plan.
            </p>
            <p>
              <Link href="/ask" className="text-primary underline">
                Ask another question
              </Link>
            </p>
          </header>
          {questions.length === 0 ? (
            <p className="text-muted-foreground">You haven&apos;t sent any questions yet.</p>
          ) : (
            <ul className="space-y-4">
              {questions.map((q) => (
                <li key={q.id} className="rounded-lg border p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={q.status === "answered" ? "default" : "outline"}>{STATUS[q.status as keyof typeof STATUS]}</Badge>
                    <span>Sent {new Date(q.created_at).toLocaleDateString("en-GB")}</span>
                  </div>
                  <p className="font-medium whitespace-pre-wrap">{q.question}</p>
                  {q.answer && (
                    <div className="rounded-lg bg-secondary p-4 text-sm whitespace-pre-wrap">
                      <span className="sr-only">Expert reply: </span>
                      {q.answer}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
