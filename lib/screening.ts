// Roster screening (round 2, PR E). Reuses ANDA's existing 5-question
// self-test set (app/self-test) -- the same areas and the same
// rarely/sometimes/often answers, reworded for an educator or caregiver
// answering about a learner.
//
// This is NOT a clinical instrument. There is no score, no cut-off and no
// validity claim: the output simply lists the areas where the observer
// answered "often", as areas worth looking into, and suggests a
// professional assessment if there are any.

export interface ScreeningQuestion {
  id: string
  domainLabel: string
  /** First-person wording used by the public self-test. */
  selfText: string
  /** Observer wording used for roster screening. */
  observerText: string
}

export const SCREENING_QUESTIONS: ScreeningQuestion[] = [
  {
    id: "social",
    domainLabel: "Social communication",
    selfText: "Do you find small talk or reading social cues more tiring than it seems to be for other people?",
    observerText: "Do they find small talk or reading social cues harder or more tiring than their peers do?",
  },
  {
    id: "attention",
    domainLabel: "Attention & focus",
    selfText: "Do you often start tasks with enthusiasm but find it hard to see them through to the end?",
    observerText: "Do they often start tasks with enthusiasm but find it hard to see them through to the end?",
  },
  {
    id: "sensory",
    domainLabel: "Sensory processing",
    selfText: "Do certain sounds, lights, or textures feel overwhelming in a way that doesn't seem to bother others?",
    observerText: "Do certain sounds, lights or textures seem to overwhelm them in a way that doesn't bother others?",
  },
  {
    id: "learning",
    domainLabel: "Reading & language",
    selfText: "Does reading or writing take noticeably more time or effort than it seems to for your peers?",
    observerText: "Does reading or writing take them noticeably more time or effort than their peers?",
  },
  {
    id: "planning",
    domainLabel: "Planning & organization",
    selfText: "Do you struggle to plan ahead, stay organized, or switch smoothly between tasks?",
    observerText: "Do they struggle to plan ahead, stay organised, or switch smoothly between tasks?",
  },
]

export const SCREENING_OPTIONS = [
  { value: "rarely", label: "Rarely" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often" },
] as const

export type ScreeningAnswer = (typeof SCREENING_OPTIONS)[number]["value"]

export const NOT_A_DIAGNOSIS =
  "This is not a diagnosis or a clinical screening tool. It has no score and doesn't say whether anyone is neurodivergent. It only notes the areas you said come up often, so you know what might be worth looking into with a qualified professional."

/** Validates a full set of answers; null if anything is missing or invalid. */
export function parseAnswers(raw: unknown): Record<string, ScreeningAnswer> | null {
  if (!raw || typeof raw !== "object") return null
  const out: Record<string, ScreeningAnswer> = {}
  for (const q of SCREENING_QUESTIONS) {
    const v = (raw as Record<string, unknown>)[q.id]
    if (v !== "rarely" && v !== "sometimes" && v !== "often") return null
    out[q.id] = v
  }
  return out
}

export interface ScreeningFlag {
  areasToLookInto: string[]
  considerProfessionalAssessment: boolean
  summary: string
}

/** Non-diagnostic flag: the areas answered "often" -- nothing more. */
export function screeningFlag(answers: Record<string, string>): ScreeningFlag {
  const areas = SCREENING_QUESTIONS.filter((q) => answers[q.id] === "often").map((q) => q.domainLabel)
  return {
    areasToLookInto: areas,
    considerProfessionalAssessment: areas.length > 0,
    summary:
      areas.length > 0
        ? `Areas to look into: ${areas.join(", ")}. Consider a professional assessment.`
        : "Nothing was marked as coming up often.",
  }
}
