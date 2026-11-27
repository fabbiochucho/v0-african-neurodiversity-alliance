"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/print-button"
import { useSpeech } from "@/lib/use-speech"
import { ADULT_QUESTIONS, AREAS, evaluateAdult, FREQ_OPTIONS, type Freq } from "@/lib/adult-check"

// Everything stays in this page's memory: nothing is sent to ANDA or stored.

export function AdultCheck({ neuRafikiUrl }: { neuRafikiUrl: string | null }) {
  const [step, setStep] = useState<"intro" | "questions" | "result">("intro")
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Freq>>({})
  const { supported, speak } = useSpeech()
  const heading = useRef<HTMLHeadingElement>(null)
  const q = ADULT_QUESTIONS[index]

  useEffect(() => heading.current?.focus(), [step, index])

  function answer(value: Freq) {
    setAnswers((a) => ({ ...a, [q.id]: value }))
    if (index + 1 < ADULT_QUESTIONS.length) setIndex(index + 1)
    else setStep("result")
  }

  if (step === "intro") {
    return (
      <div className="space-y-6">
        <h1 ref={heading} tabIndex={-1} className="text-4xl font-bold text-balance outline-none">
          Could I be neurodivergent?
        </h1>
        <p className="text-muted-foreground">
          A self-check for adults who were never assessed. Many people only start wondering in their 30s or 40s, often
          when a child or relative is diagnosed. {ADULT_QUESTIONS.length} short statements about attention, social life,
          senses, reading, numbers and movement. It takes about 7 minutes.
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>This is not a diagnosis. Only a trained professional can assess you.</li>
          <li>Your answers stay on this phone or computer. ANDA doesn&apos;t see or keep them.</li>
          <li>
            Answer for how things have usually been for you over the years, compared with people around you in your own
            community, not on a good or bad day.
          </li>
        </ul>
        <Button
          size="lg"
          onClick={() => {
            setIndex(0)
            setAnswers({})
            setStep("questions")
          }}
        >
          Start
        </Button>
        <p className="text-sm">
          Asking about a young child?{" "}
          <Link href="/check" className="text-primary underline">
            Use the early development check
          </Link>
          .
        </p>
        <p className="text-xs text-muted-foreground">
          Written by ANDA in our own words, for adults in Africa and the global south. It covers the areas adult
          assessments look at, but has not yet been tested in a research study.
        </p>
      </div>
    )
  }

  if (step === "questions" && q) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {index + 1} of {ADULT_QUESTIONS.length}
          {q.childhood ? " · about your childhood" : ""}
        </p>
        <div className="h-2 rounded bg-secondary" aria-hidden="true">
          <div className="h-2 rounded bg-primary" style={{ width: `${(index / ADULT_QUESTIONS.length) * 100}%` }} />
        </div>
        <fieldset className="space-y-4">
          <legend>
            <h1 ref={heading} tabIndex={-1} className="text-2xl font-semibold text-balance outline-none">
              {q.text}
            </h1>
          </legend>
          {supported && (
            <Button type="button" variant="outline" size="sm" onClick={() => speak(q.text)}>
              Read aloud
            </Button>
          )}
          <div className="grid gap-3">
            {FREQ_OPTIONS.map((o) => (
              <Button
                key={o.value}
                type="button"
                size="lg"
                variant={answers[q.id] === o.value ? "default" : "outline"}
                aria-pressed={answers[q.id] === o.value}
                className="h-12 text-base"
                onClick={() => answer(o.value)}
              >
                {o.label}
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

  const result = evaluateAdult(answers)
  const areas = result.explore.filter((a) => a !== "wellbeing")

  return (
    <div className="space-y-6">
      <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold outline-none">
        What your answers suggest
      </h1>

      {result.wellbeing && (
        <section role="alert" className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-5 space-y-2 text-sm">
          <h2 className="text-lg font-semibold">{AREAS.wellbeing.label}</h2>
          <p>{AREAS.wellbeing.explore}</p>
          <p>
            If you have thoughts of harming yourself, please contact someone now: a trusted person, your local emergency
            number, or a free crisis line for your country at{" "}
            <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              findahelpline.com
            </a>
            .
          </p>
        </section>
      )}

      {areas.length > 0 ? (
        <section className="space-y-4">
          <p>
            These areas are <strong>worth exploring with a professional</strong>. That is not a diagnosis: many things
            can explain the same experiences, and it is common for more than one area to show up together.
          </p>
          {areas.map((a) => (
            <div key={a} className="rounded-lg border p-4 space-y-1">
              <h2 className="text-lg font-semibold">{AREAS[a].label}</h2>
              <p className="text-sm">{AREAS[a].explore}</p>
              <p className="text-xs text-muted-foreground">
                You answered &quot;often&quot; or &quot;very often&quot; to {result.counts[a].present} of {result.counts[a].asked}.
              </p>
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-lg border p-5 space-y-2">
          <h2 className="text-lg font-semibold">No area stood out strongly</h2>
          <p className="text-sm">
            Your answers don&apos;t point strongly to any one area. Self-checks miss things, though: if you have long
            wondered about yourself, your own sense of it matters, and you can still ask for an assessment.
          </p>
        </section>
      )}

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-semibold">If you want an assessment</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Ask a doctor for a referral to a psychiatrist or clinical psychologist who assesses adults (for reading or
            numbers, an educational psychologist).
          </li>
          <li>
            Bring examples from your childhood and your life now, school reports if you have them, and if possible
            someone who knew you as a child, such as a parent, older sibling or aunt.
          </li>
          <li>
            A diagnosis can help you understand yourself, get adjustments at work or in study, and find others like you.
            Whether to seek one is your choice.
          </li>
          <li>
            <Link href="/directory" className="text-primary underline">
              Find Support
            </Link>{" "}
            lists verified services by country, and{" "}
            <Link href={`/ask?q=${encodeURIComponent("Can adults be diagnosed with autism or ADHD?")}`} className="text-primary underline">
              ANDA&apos;s answer on adult diagnosis
            </Link>{" "}
            explains more.
          </li>
          {neuRafikiUrl && (
            <li>
              For a longer, more detailed self-assessment, try{" "}
              <a href={neuRafikiUrl} className="text-primary underline">
                NeuRafiki&apos;s adult assessment
              </a>
              .
            </li>
          )}
        </ul>
        <PrintButton />
      </section>

      <p className="text-xs text-muted-foreground">
        General information, not a diagnosis. This check hasn&apos;t yet been tested in a research study.
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
