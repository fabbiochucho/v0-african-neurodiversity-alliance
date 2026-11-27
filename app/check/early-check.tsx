"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/print-button"
import { useSpeech } from "@/lib/use-speech"
import { evaluate, LEVEL_TEXT, MAX_MONTHS, MIN_MONTHS, questionsForAge, type Answer } from "@/lib/early-check"

// Everything stays in this page's memory: nothing is sent to ANDA or stored (children's data).
// Read aloud uses the phone's or computer's own voice (speechSynthesis): no download, no vendor.

const ANSWERS: { value: Answer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "sometimes", label: "Sometimes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
]

const WHO = ["Mother", "Father", "Grandparent", "Another relative", "Nanny or carer", "Teacher or childminder", "Other"]

const AGES = Array.from({ length: MAX_MONTHS - MIN_MONTHS + 1 }, (_, i) => MIN_MONTHS + i)
const ageLabel = (m: number) => (m % 12 === 0 ? `${m} months (${m / 12} year${m === 12 ? "" : "s"})` : `${m} months`)

export function EarlyCheck() {
  const [step, setStep] = useState<"intro" | "questions" | "result">("intro")
  const [months, setMonths] = useState<number | null>(null)
  const [who, setWho] = useState("")
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const { supported, speak } = useSpeech()
  const heading = useRef<HTMLHeadingElement>(null)

  const questions = months ? questionsForAge(months) : []
  const q = questions[index]

  // Move focus to each new question or the result, for screen readers and keyboards.
  useEffect(() => heading.current?.focus(), [step, index])

  function answer(value: Answer) {
    setAnswers((a) => ({ ...a, [q.id]: value }))
    if (index + 1 < questions.length) setIndex(index + 1)
    else setStep("result")
  }

  if (step === "intro") {
    return (
      <div className="space-y-6">
        <h1 ref={heading} tabIndex={-1} className="text-4xl font-bold text-balance outline-none">
          Early development check
        </h1>
        <p className="text-muted-foreground">
          For a child aged 12 to 36 months. About 15 to 19 short questions on how your child plays, communicates and
          responds, then clear next steps. It takes about 5 minutes.
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>This is not a test and not a diagnosis. Only a trained professional can assess a child.</li>
          <li>Your answers stay on this phone or computer. ANDA doesn&apos;t see or keep them.</li>
          <li>Answer for what your child usually does. &quot;Not sure&quot; is fine.</li>
        </ul>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (months) {
              setIndex(0)
              setAnswers({})
              setStep("questions")
            }
          }}
        >
          <label className="block space-y-1">
            <span className="font-medium">How old is the child?</span>
            <select
              required
              value={months ?? ""}
              onChange={(e) => setMonths(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-3 border rounded-lg bg-background text-base"
            >
              <option value="">Choose an age</option>
              {AGES.map((m) => (
                <option key={m} value={m}>
                  {ageLabel(m)}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              If your child was born more than 3 weeks early, ask a health worker whether to use their corrected age.
            </span>
          </label>
          <label className="block space-y-1">
            <span className="font-medium">Who is answering? (optional)</span>
            <select value={who} onChange={(e) => setWho(e.target.value)} className="w-full px-3 py-3 border rounded-lg bg-background text-base">
              <option value="">Prefer not to say</option>
              {WHO.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </label>
          <Button type="submit" size="lg" disabled={!months}>
            Start
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Written by ANDA for families in Africa and the global south. It looks at the same early signs as recognised
          screening tools, in our own words, but it has not yet been tested in a research study. If you are worried
          about a child of any age, see a health worker.
        </p>
        <p className="text-sm">
          Wondering about yourself as an adult?{" "}
          <Link href="/check/adult" className="text-primary underline">
            Use the adult self-check
          </Link>
          .
        </p>
      </div>
    )
  }

  if (step === "questions" && q) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Question {index + 1} of {questions.length}
        </p>
        <div className="h-2 rounded bg-secondary" aria-hidden="true">
          <div className="h-2 rounded bg-primary" style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
        <fieldset className="space-y-4">
          <legend>
            <h1 ref={heading} tabIndex={-1} className="text-2xl font-semibold text-balance outline-none">
              {q.text}
            </h1>
          </legend>
          {q.note && <p className="text-sm text-muted-foreground">{q.note}</p>}
          {supported && (
            <Button type="button" variant="outline" size="sm" onClick={() => speak(`${q.text} ${q.note ?? ""}`)}>
              Read aloud
            </Button>
          )}
          <div className="grid grid-cols-2 gap-3">
            {ANSWERS.map((a) => (
              <Button
                key={a.value}
                type="button"
                size="lg"
                variant={answers[q.id] === a.value ? "default" : "outline"}
                aria-pressed={answers[q.id] === a.value}
                className="h-14 text-base"
                onClick={() => answer(a.value)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </fieldset>
        {index > 0 && (
          <Button type="button" variant="ghost" onClick={() => setIndex(index - 1)}>
            Back
          </Button>
        )}
      </div>
    )
  }

  const result = evaluate(months ?? MIN_MONTHS, answers)
  const text = LEVEL_TEXT[result.level]
  const tone =
    result.level === "soon" ? "border-destructive/50 bg-destructive/5" : result.level === "check" ? "border-primary/40 bg-primary/5" : "border-secondary"

  return (
    <div className="space-y-6">
      <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold outline-none">
        Your next steps
      </h1>
      <section className={`rounded-lg border-2 p-5 space-y-2 ${tone}`}>
        <h2 className="text-xl font-semibold">{text.title}</h2>
        <p>{text.body}</p>
        {result.reasons.length > 0 && (
          <ul className="list-disc pl-5">
            {result.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
      </section>

      {result.hearingCheck && (
        <p className="rounded-lg border p-4 text-sm">
          <strong>Ask for a hearing check.</strong> Hearing problems can look like not responding or late talking, and
          they can be treated.
        </p>
      )}
      {result.motorCheck && (
        <p className="rounded-lg border p-4 text-sm">
          <strong>Walking:</strong> most children walk on their own by 18 months. Ask a health worker to check your
          child&apos;s movement and strength.
        </p>
      )}

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">What to take to the appointment</h2>
        <p>
          Child&apos;s age: {months ? ageLabel(months) : ""}
          {who && `. Answered by: ${who}`}.
        </p>
        {result.concerns.length > 0 && <p>Areas you answered with a concern: {result.concerns.join(", ")}.</p>}
        {result.partly.length > 0 && <p>Areas answered &quot;sometimes&quot;: {result.partly.join(", ")}.</p>}
        {result.unsure.length > 0 && (
          <p>
            Not sure about: {result.unsure.join(", ")}. Ask someone who spends more time with your child, or watch for it
            over the next week.
          </p>
        )}
        <p>Bring short phone videos of anything you are unsure about. They help a professional a lot.</p>
        <PrintButton />
      </section>

      <section className="space-y-2 text-sm print:hidden">
        <h2 className="text-lg font-semibold">Where to go</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Start with a health worker, clinic or paediatrician and ask for a developmental assessment.</li>
          <li>
            <Link href="/directory" className="text-primary underline">
              Find Support
            </Link>{" "}
            lists verified services by country.
          </li>
          <li>
            <Link href={`/ask?q=${encodeURIComponent("How do I get my child assessed or diagnosed?")}`} className="text-primary underline">
              How to get an assessment
            </Link>{" "}
            and{" "}
            <Link href={`/ask?q=${encodeURIComponent("What are the early signs of autism in young children?")}`} className="text-primary underline">
              early signs of autism
            </Link>
            , from ANDA&apos;s reviewed answers.
          </li>
          <li>
            For milestones in every area at each age, see the US CDC&apos;s free{" "}
            <a href="https://www.cdc.gov/act-early/milestones/index.html" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Learn the Signs. Act Early. checklists
            </a>
            .
          </li>
        </ul>
      </section>

      <p className="text-xs text-muted-foreground">
        This check is general information, not a diagnosis. It hasn&apos;t yet been tested in a research study, so a
        reassuring result never outweighs your own worry: if you are concerned, see a professional.
      </p>
      <Button
        type="button"
        variant="outline"
        className="print:hidden"
        onClick={() => {
          setStep("intro")
          setAnswers({})
          setIndex(0)
        }}
      >
        Start again
      </Button>
    </div>
  )
}
