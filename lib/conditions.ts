// Conditions a Find Support directory entry can be tagged with
// (public.resources.conditions, scripts/040_add_resource_conditions.sql).
// ALL_NEURODIVERGENT marks organisations whose remit covers neurodivergence
// broadly rather than one condition.
export const ALL_NEURODIVERGENT = "All neurodivergent"

export const CONDITIONS = [
  "Autism",
  "ADHD",
  "Dyslexia",
  "Dyscalculia",
  "Dysgraphia",
  "Dyspraxia (DCD)",
  "OCD",
  "Tourette's",
  "Sensory processing",
  "Learning differences",
  "Intellectual disability",
  "Down syndrome",
  "Cerebral palsy",
  "Disabilities (general)",
] as const

// "all" = no filter. A specific condition also matches organisations that
// support all neurodivergent people, since they serve that condition too.
export function matchesCondition(conditions: string[], selected: string): boolean {
  if (selected === "all") return true
  return conditions.includes(selected) || conditions.includes(ALL_NEURODIVERGENT)
}
