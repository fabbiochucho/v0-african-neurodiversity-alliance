// Maps Neu Rafiki's GET /api/federation/assessment-results response onto this
// app's DiagnosisDomain / GoalDomain unions (see lib/types/iep.ts).
//
// The shared federation contract fixes env vars, JWT payload shapes, and the
// linked_accounts table exactly across both repos, but the JSON body shape of
// Neu Rafiki's assessment-results response wasn't part of that contract (it's
// Neu Rafiki-only per Phase 1 scope, so this repo only knows about it as a
// caller). Verified directly against Neu Rafiki's actual implementation
// (app/api/federation/assessment-results/route.ts):
//
//   { results: [ { profile_ref: { name, age, diagnosis_domains }, domains: [
//       { domain_name, risk_level, percentage_score, recommendations } ] ,
//       completed_at, source, source_assessment_id } ] }
//
// domain_name values come from Neu Rafiki's assessment_domains.name column
// (scripts/002_seed_assessment_domains.sql / 005_seed_comprehensive_questions.sql):
// "Autism Spectrum", "ADHD", "Dyslexia/Learning Differences",
// "Dyspraxia/Motor Coordination", "Sensory Processing", "Executive Function".
//
// This mapper is deliberately defensive: unrecognized domain names are simply
// skipped rather than causing an error, so a future change to Neu Rafiki's
// domain names degrades to "that domain wasn't imported" instead of a broken
// import step.

import type { DiagnosisDomain, GoalDomain } from "@/lib/types/iep"

export interface RemoteAssessmentDomainResult {
  domain_name: string
  risk_level: string
  percentage_score: number
  recommendations: string | null
}

export interface RemoteProfileResult {
  profile_ref: {
    name: string
    age: number | null
    diagnosis_domains: string[]
  }
  domains: RemoteAssessmentDomainResult[]
  completed_at: string
  source: string
  source_assessment_id: string
}

export interface RemoteAssessmentResultsResponse {
  results: RemoteProfileResult[]
}

const DIAGNOSIS_DOMAIN_SYNONYMS: Record<string, DiagnosisDomain> = {
  asd: "ASD",
  autism: "ASD",
  autism_spectrum: "ASD",
  autism_spectrum_disorder: "ASD",
  adhd: "ADHD",
  attention_deficit: "ADHD",
  attention_deficit_hyperactivity_disorder: "ADHD",
  dyslexia: "Dyslexia",
  reading: "Dyslexia",
  language_processing: "Dyslexia",
  dyslexia_learning_differences: "Dyslexia",
  learning_differences: "Dyslexia",
  dyspraxia: "Dyspraxia",
  motor_coordination: "Dyspraxia",
  motor: "Dyspraxia",
  dyspraxia_motor_coordination: "Dyspraxia",
  sensory: "Sensory",
  sensory_processing: "Sensory",
  cognitive: "Cognitive",
  executive_function: "Cognitive",
  executive: "Cognitive",
}

// Rough downstream mapping used only to pre-fill a suggested goal's domain
// field (GoalDomain is a different, goal-tracking union from DiagnosisDomain).
const DIAGNOSIS_TO_GOAL_DOMAIN: Record<DiagnosisDomain, GoalDomain> = {
  ASD: "communication",
  ADHD: "attention",
  Dyslexia: "academic",
  Dyspraxia: "motor",
  Sensory: "sensory",
  Cognitive: "academic",
}

function normalizeDomainKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s\-/]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export function mapRemoteDomainToDiagnosisDomain(raw: string): DiagnosisDomain | null {
  return DIAGNOSIS_DOMAIN_SYNONYMS[normalizeDomainKey(raw)] ?? null
}

export function goalDomainForDiagnosisDomain(domain: DiagnosisDomain): GoalDomain {
  return DIAGNOSIS_TO_GOAL_DOMAIN[domain]
}

export interface MappedDomainResult {
  domain: DiagnosisDomain
  profileName: string
  source: RemoteAssessmentDomainResult
}

// Flattens every consented profile's domain results across the whole
// response into the subset this app can use, tagging each with the source
// profile's name (a Neu Rafiki account can hold profiles for multiple family
// members, and Neu Rafiki only includes profiles with active federation_sync
// consent — everything returned here is already consent-gated on their side).
// Domains that don't match a known synonym are silently dropped rather than
// erroring, so an unrecognized/renamed domain degrades gracefully.
export function mapRemoteAssessmentResult(
  remote: RemoteAssessmentResultsResponse,
): MappedDomainResult[] {
  if (!remote || !Array.isArray(remote.results)) return []

  const mapped: MappedDomainResult[] = []
  for (const profileResult of remote.results) {
    if (!profileResult || !Array.isArray(profileResult.domains)) continue
    const profileName = profileResult.profile_ref?.name || "Neu Rafiki profile"
    for (const entry of profileResult.domains) {
      if (!entry?.domain_name) continue
      const domain = mapRemoteDomainToDiagnosisDomain(entry.domain_name)
      if (domain) mapped.push({ domain, profileName, source: entry })
    }
  }
  return mapped
}
