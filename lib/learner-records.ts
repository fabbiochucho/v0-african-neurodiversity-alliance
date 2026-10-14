// Learner records and data kinds (brief §7, §12, §23, §44). Everything the
// UI shows about a learner says where it came from, using these labels.

export type DataKind = "observation" | "professional_input" | "assessment" | "check_in" | "ai_interpretation"

export const DATA_KIND_LABELS: Record<DataKind, { label: string; description: string }> = {
  observation: { label: "Observation", description: "Written by family, carers or the person themselves." },
  professional_input: { label: "Professional input", description: "From a diagnosis, school assessment or existing plan." },
  assessment: { label: "NeuRafiki assessment", description: "A summary imported from a NeuRafiki assessment." },
  check_in: { label: "NeuRafiki check-in", description: "A structured check-in summary shared from NeuRafiki." },
  ai_interpretation: { label: "AI draft", description: "Written by AI. Not part of the plan until a person approves it." },
}

export const SUPPORT_PROFILE_FIELDS = [
  { key: "strengths", label: "Strengths", hint: "What they're good at, enjoy, or care about." },
  { key: "difficulties", label: "Difficulties", hint: "What is hard for them right now." },
  { key: "what_helps", label: "What helps", hint: "Things that make a difference." },
  { key: "communication", label: "Communication", hint: "How they communicate and how best to communicate with them." },
  { key: "sensory", label: "Sensory needs", hint: "Sounds, lights, textures, movement: what they seek or avoid." },
  { key: "school_context", label: "School or work context", hint: "Where they learn or work, and the support there." },
] as const

export type SupportProfileKey = (typeof SUPPORT_PROFILE_FIELDS)[number]["key"]
export type SupportProfile = Partial<Record<SupportProfileKey, string>>

export const ASSESSMENT_TYPES = [
  { value: "diagnosis", label: "Professional diagnosis" },
  { value: "school_assessment", label: "School assessment" },
  { value: "existing_iep", label: "Existing IEP or support plan" },
  { value: "other_assessment", label: "Other assessment" },
] as const

export type AssessmentType = (typeof ASSESSMENT_TYPES)[number]["value"]

export const MAX_FIELD_CHARS = 2000

/** Trims and validates a support profile; null if every field is empty or one is too long. */
export function parseSupportProfile(raw: unknown): SupportProfile | null {
  if (!raw || typeof raw !== "object") return null
  const out: SupportProfile = {}
  for (const { key } of SUPPORT_PROFILE_FIELDS) {
    const v = (raw as Record<string, unknown>)[key]
    if (v == null || v === "") continue
    if (typeof v !== "string" || v.length > MAX_FIELD_CHARS) return null
    if (v.trim()) out[key] = v.trim()
  }
  return Object.keys(out).length > 0 ? out : null
}

export interface ExistingAssessmentInput {
  record_type: AssessmentType
  record_date: string | null
  author: string | null
  title: string | null
  summary: string
}

export function parseExistingAssessment(raw: Record<string, unknown>): ExistingAssessmentInput | { error: string } {
  const type = ASSESSMENT_TYPES.find((t) => t.value === raw.record_type)?.value
  if (!type) return { error: "Choose the type of assessment." }
  const summary = typeof raw.summary === "string" ? raw.summary.trim() : ""
  if (!summary) return { error: "Add a short summary." }
  if (summary.length > MAX_FIELD_CHARS) return { error: `Keep the summary under ${MAX_FIELD_CHARS} characters.` }
  const date = typeof raw.record_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.record_date) ? raw.record_date : null
  const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null)
  return { record_type: type, record_date: date, author: text(raw.author, 200), title: text(raw.title, 300), summary }
}

export const ASSESSMENT_FILE_TYPES: Record<string, string> = { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg" }
export const ASSESSMENT_FILE_MAX_BYTES = 10 * 1024 * 1024
