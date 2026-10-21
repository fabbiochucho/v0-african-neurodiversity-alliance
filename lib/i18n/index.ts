// Localisation (brief §40-41). Site pages can be shown in English, French or
// Portuguese (SITE_LANGUAGES, chosen with the language picker); a learner's
// plan language (LANGUAGES) is English only for now. Education-context
// terminology only adjusts labels in the plan. No legal-compliance claims are made.
import { en, type MessageKey } from "./en"
import { fr } from "./fr"
import { pt } from "./pt"

export type { MessageKey }

/** Languages a learner's plan can be written in. */
export const LANGUAGES = [{ code: "en", label: "English" }] as const
export type LanguageCode = (typeof LANGUAGES)[number]["code"]

/** Languages the site itself can be shown in. Labels are in their own language. */
export const SITE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
] as const
export type SiteLanguage = (typeof SITE_LANGUAGES)[number]["code"]
export const SITE_LANGUAGE_COOKIE = "anda-lang"

export function isSiteLanguage(v: unknown): v is SiteLanguage {
  return typeof v === "string" && SITE_LANGUAGES.some((l) => l.code === v)
}

const DICTIONARIES: Record<SiteLanguage, Partial<Record<MessageKey, string>>> = { en, fr, pt }

/** t("plan.disclaimer", { plan: "IEP" }) -- falls back to English, then the key. */
export function t(key: MessageKey, vars: Record<string, string | number> = {}, lang: string = "en"): string {
  const dict = DICTIONARIES[isSiteLanguage(lang) ? lang : "en"]
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

// Owner decision (Oct 2026): every name says the plan helps you prepare for
// the official process, never that it is the official plan (the UK EHCP
// wording is the pattern). Local educators should confirm each term.
const PLAN_TERMS: Record<EducationContext, { planName: string; planShort: string }> = {
  nigeria_inclusive: { planName: "Support plan (to help you prepare for IEP conversations with your school)", planShort: "Support Plan" },
  kenya_cbc: { planName: "Support plan (to help you prepare for IEP conversations under CBC)", planShort: "Support Plan" },
  south_africa_sias: { planName: "Support plan (to help you prepare for SIAS support conversations)", planShort: "Support Plan" },
  uk_ehcp: { planName: "Support plan (to help you prepare for EHCP conversations)", planShort: "Support Plan" },
  us_idea_504: { planName: "Support plan (to help you prepare for IEP or 504 meetings)", planShort: "Support Plan" },
  other: { planName: "Support plan", planShort: "Support Plan" },
}

export function isEducationContext(v: unknown): v is EducationContext {
  return typeof v === "string" && EDUCATION_CONTEXTS.some((c) => c.value === v)
}

export function termsFor(context: unknown, lang = "en"): Terms {
  const terms = PLAN_TERMS[isEducationContext(context) ? context : "other"]
  return { ...terms, disclaimer: t("plan.disclaimer", { plan: terms.planShort }, lang) }
}
