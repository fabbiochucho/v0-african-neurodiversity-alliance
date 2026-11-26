import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { CRISIS_RESPONSE, detectCrisis } from "@/lib/companion"
import { findReviewedAnswers, MAX_QUESTION_CHARS } from "@/lib/reviewed-answers"
import { AnswerFeedback, AskExpert } from "./ask-client"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Ask a question | ANDA",
  description: "Answers written and checked by people at ANDA, and an expert for anything they don't cover.",
}

// Free for everyone and no AI: the answers shown are exactly what people at ANDA wrote and
// approved. Sending a question to an expert needs an account so the reply can reach you.
export default async function AskPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, MAX_QUESTION_CHARS)
  const supabase = await createClient()
  const [{ data: auth }, answers] = await Promise.all([supabase.auth.getUser(), q ? findReviewedAnswers(supabase, q) : Promise.resolve([])])
  const crisis = q ? detectCrisis(q) : false

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold text-balance">Ask a question</h1>
            <p className="text-muted-foreground">
              Answers here were written by people at ANDA and checked by a second person before they were published. If
              none covers your question, you can send it to an ANDA expert. This is general guidance, not a diagnosis or
              treatment plan.
            </p>
          </header>

          <form action="/ask" method="get" className="space-y-2">
            <label htmlFor="ask-q" className="text-sm font-medium">
              Your question
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="ask-q"
                name="q"
                type="search"
                defaultValue={q}
                maxLength={MAX_QUESTION_CHARS}
                placeholder="e.g. How can we make bedtime calmer?"
                className="flex-1 px-3 py-2 border rounded-lg bg-background"
              />
              <Button type="submit">Search answers</Button>
            </div>
            <p className="text-xs text-muted-foreground">Please don&apos;t include names or health records.</p>
          </form>

          {crisis && (
            <div role="alert" className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-4 text-sm whitespace-pre-wrap">
              {CRISIS_RESPONSE}
            </div>
          )}

          {q && (
            <section aria-labelledby="answers-heading" className="space-y-4">
              <h2 id="answers-heading" className="text-2xl font-semibold">
                {answers.length > 0 ? "Reviewed answers" : "No reviewed answer covers this yet"}
              </h2>
              {answers.map((a) => (
                <article key={a.id} className="rounded-lg border p-5 space-y-3">
                  <h3 className="text-lg font-semibold">{a.question}</h3>
                  <p className="whitespace-pre-wrap text-sm">{a.answer}</p>
                  {a.sources && <p className="text-xs text-muted-foreground">Sources: {a.sources}</p>}
                  <AnswerFeedback id={a.id} />
                </article>
              ))}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 space-y-3">
                <h2 className="text-lg font-semibold">{answers.length > 0 ? "Not what you needed?" : "Ask an ANDA expert"}</h2>
                {auth.user ? (
                  <AskExpert question={q} />
                ) : (
                  <p className="text-sm">
                    <Link href={`/auth/login?redirectTo=${encodeURIComponent(`/ask?q=${q}`)}`} className="text-primary underline">
                      Sign in
                    </Link>{" "}
                    to send this question to an ANDA expert. Their reply comes to your account.
                  </p>
                )}
              </div>
            </section>
          )}

          {auth.user && (
            <p className="text-sm">
              <Link href="/ask/mine" className="text-primary underline">
                Your questions and answers
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
