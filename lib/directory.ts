// Vocabulary for the Find Support directory's detail fields (scripts/053).
// Values are stored as these keys; labels live in lib/i18n/messages/directory.ts
// under dir.service.*, dir.curriculum.*, dir.provider.* and dir.age.*.

export const SERVICES = [
  "assessment", // screening or diagnostic assessment
  "speech_therapy",
  "occupational_therapy",
  "physiotherapy",
  "behaviour_therapy", // ABA and other behavioural approaches
  "psychology", // counselling, psychotherapy, educational psychology
  "psychiatry",
  "paediatrics", // developmental and general paediatrics
  "neurology",
  "special_education",
  "inclusive_education",
  "early_intervention",
  "vocational_training",
  "parent_training",
  "residential_care",
  "support_group",
  "helpline",
] as const
export type Service = (typeof SERVICES)[number]

export const CURRICULA = [
  "national",
  "british",
  "american",
  "ib",
  "montessori",
  "french",
  "individualised", // IEP-led special-education programme
  "life_skills",
] as const
export type Curriculum = (typeof CURRICULA)[number]

export const PROVIDER_TYPES = ["public", "private", "ngo", "faith", "university"] as const
export type ProviderType = (typeof PROVIDER_TYPES)[number]

export const AGE_BRACKETS = [
  { key: "0-2", min: 0, max: 2 },
  { key: "3-5", min: 3, max: 5 },
  { key: "6-12", min: 6, max: 12 },
  { key: "13-17", min: 13, max: 17 },
  { key: "18+", min: 18, max: 120 },
] as const
export type AgeBracketKey = (typeof AGE_BRACKETS)[number]["key"]

/** Does a listing's age range overlap the bracket? Listings with no ages stated always match. */
export function servesAgeBracket(ageMin: number | null, ageMax: number | null, key: string): boolean {
  const b = AGE_BRACKETS.find((x) => x.key === key)
  if (!b || (ageMin == null && ageMax == null)) return true
  return (ageMin ?? 0) <= b.max && (ageMax ?? 120) >= b.min
}

/** "Ages 3–12", "Ages 18+", "From age 4", or null when not stated. */
export function ageLabel(ageMin: number | null, ageMax: number | null): { min: number | null; max: number | null } | null {
  if (ageMin == null && ageMax == null) return null
  return { min: ageMin, max: ageMax != null && ageMax >= 100 ? null : ageMax }
}
