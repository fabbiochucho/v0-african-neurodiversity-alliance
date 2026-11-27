import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { CRISIS_RESPONSE, detectCrisis } from "@/lib/companion"
import { headers } from "next/headers"
import { CONTEXT_HEADING, DIAGNOSIS_NOTE, findReviewedAnswers, MAX_QUESTION_CHARS, reviewLabel, withContext } from "@/lib/reviewed-answers"
import { AFRICAN_COUNTRIES, countryName, resolveCountry } from "@/lib/country"
import { AnswerFeedback, AskExpert } from "./ask-client"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Ask a question | ANDA",
  description: "Answers written and checked by people at ANDA, and an expert for anything they don't cover.",
}

// Free for everyone and no AI: the answers shown are exactly what people at ANDA wrote and
// approved. Sending a question to an expert needs an account so the reply can reach you.
// Local context: the country comes from ?country= (the person's choice) or Vercel's country header;
// ANDA never reads or stores the IP address. "?country=none" switches it off.
export default async function AskPage({ searchParams }: { searchParams: Promise<{ q?: string; country?: string }> }) {
  const params = await searchParams
  const q = (params.q ?? "").trim().slice(0, MAX_QUESTION_CHARS)
  const country = resolveCountry(params.country, await headers())
  const place = countryName(country)
  const supabase = await createClient()
  const [{ data: auth }, found, { data: services }] = await Promise.all([
    supabase.auth.getUser(),
    q ? findReviewedAnswers(supabase, q) : Promise.resolve([]),
    q && place
      ? supabase.from("resources").select("id, name, location, url").eq("country", place).eq("verified", true).eq("is_published", true).limit(3)
      : Promise.resolve({ data: [] as { id: string; name: string; location: string | null; url: string | null }[] }),
  ])
  const answers = await withContext(supabase, found, country)
  const crisis = q ? detectCrisis(q) : false

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold text-balance">Ask a question</h1>
            <p className="text-muted-foreground">
              Answers here are written from WHO guidance and published research, and a second person at ANDA checks each
              one against its sources before it is published. Each answer says whether a clinician has reviewed it yet.
              If none covers your question, you can send it to ANDA. This is general guidance, not a diagnosis or
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
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <label htmlFor="ask-country">Local information for</label>
              <select id="ask-country" name="country" defaultValue={country ?? "none"} className="px-2 py-1 border rounded-lg bg-background">
                <option value="none">No country (Africa-wide only)</option>
                {Object.entries(AFRICAN_COUNTRIES)
                  .sort((a, b) => a[1].localeCompare(b[1]))
                  .map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
              </select>
            </div>
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
                  {(a.context ?? []).map((c) => (
                    <div key={`${c.scope}-${c.kind}`} className="rounded-lg bg-secondary p-4 text-sm space-y-1">
                      <h4 className="font-semibold">{c.kind === "local" && c.scope !== "africa" && place ? `In ${place}` : CONTEXT_HEADING[c.kind]}</h4>
                      <p className="whitespace-pre-wrap">{c.note}</p>
                      {c.sources && <p className="text-xs text-muted-foreground">Sources: {c.sources}</p>}
                    </div>
                  ))}
                  {a.sources && <p className="text-xs text-muted-foreground">Sources: {a.sources}</p>}
                  <p className="text-xs text-muted-foreground">{reviewLabel(a)}</p>
                  <AnswerFeedback id={a.id} />
                </article>
              ))}
              {answers.length > 0 && place && (services ?? []).length > 0 && (
                <div className="rounded-lg border p-4 text-sm space-y-2">
                  <h3 className="font-semibold">Verified services in {place}</h3>
                  <ul className="space-y-1">
                    {(services ?? []).map((r) => (
                      <li key={r.id}>
                        {r.url ? (
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            {r.name}
                          </a>
                        ) : (
                          r.name
                        )}
                        {r.location && <span className="text-muted-foreground"> · {r.location}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {answers.length > 0 && (
                <p role="note" className="rounded-lg border p-4 text-sm">
                  {DIAGNOSIS_NOTE}{" "}
                  <Link href="/directory" className="text-primary underline">
                    Open Find Support
                  </Link>
                </p>
              )}
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
