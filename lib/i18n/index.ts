// Localisation (brief §40-41). String infrastructure with English as the
// only language for now, plus education-context terminology used only to
// adjust labels in the plan. No legal-compliance claims are made.
import { en, type MessageKey } from "./en"

export const LANGUAGES = [{ code: "en", label: "English" }] as const
export type LanguageCode = (typeof LANGUAGES)[number]["code"]

const DICTIONARIES: Record<LanguageCode, Record<MessageKey, string>> = { en }

/** t("plan.disclaimer", { plan: "IEP" }) -- falls back to English, then the key. */
export function t(key: MessageKey, vars: Record<string, string | number> = {}, lang: string = "en"): string {
  const dict = DICTIONARIES[(LANGUAGES.some((l) => l.code === lang) ? lang : "en") as LanguageCode]
  const template = dict[key] ?? en[key] ?? key
  return template.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`))
}

export const EDUCATION_CONTEXTS = [
  { value: "nigeria_inclusive", label: "Nigeria: inclusive education" },
  { value: "kenya_cbc", label: "Kenya: Competency-Based Curriculum (CBC)" },
  { value: "south_africa_sias", label: "South Africa: SIAS" },
  { value: "uk_ehcp", label: "UK: EHCP" },
  { value: "us_idea_504", label: "US: IDEA / Section 504" },
  { value: "other", label: "Other" },
] as const
export type EducationContext = (typeof EDUCATION_CONTEXTS)[number]["value"]

export interface Terms {
  /** Full name of ANDA's plan in this context. */
  planName: string
  /** Short label used in buttons and headings. */
  planShort: string
  disclaimer: string
}

const PLAN_TERMS: Record<EducationContext, { planName: string; planShort: string }> = {
  nigeria_inclusive: { planName: "Individualised Education Plan (IEP)", planShort: "IEP" },
  kenya_cbc: { planName: "Individualised Education Plan (IEP)", planShort: "IEP" },
  south_africa_sias: { planName: "Individual Support Plan", planShort: "Support Plan" },
  uk_ehcp: { planName: "Support plan (to help you prepare for EHCP conversations)", planShort: "Support Plan" },
  us_idea_504: { planName: "IEP / 504 plan notes", planShort: "IEP" },
  other: { planName: "Support Plan", planShort: "Support Plan" },
}

export function isEducationContext(v: unknown): v is EducationContext {
  return typeof v === "string" && EDUCATION_CONTEXTS.some((c) => c.value === v)
}

export function termsFor(context: unknown, lang = "en"): Terms {
  const terms = PLAN_TERMS[isEducationContext(context) ? context : "other"]
  return { ...terms, disclaimer: t("plan.disclaimer", { plan: terms.planShort }, lang) }
}
