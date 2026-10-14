// Turns Neu Rafiki's assessment results into a consented summary stored in
// ANDA as data kind 'assessment' (brief §14, §43). Only domain-level
// results cross over -- never raw responses.
import { mapRemoteAssessmentResult, type RemoteAssessmentResultsResponse } from "@/lib/federation/map-assessment-domains"
import type { DiagnosisDomain } from "@/lib/types/iep"

export interface AssessmentSummary {
  sourceAssessmentId: string | null
  profileName: string
  completedAt: string | null
  areas: DiagnosisDomain[]
  summary: string
}

/** One summary per Neu Rafiki profile; optionally only the given assessment. */
export function summariseAssessments(raw: unknown, onlyAssessmentId?: string | null): AssessmentSummary[] {
  const data = raw as RemoteAssessmentResultsResponse
  if (!data || !Array.isArray(data.results)) return []
  const results = onlyAssessmentId ? data.results.filter((r) => r.source_assessment_id === onlyAssessmentId) : data.results

  return results
    .map((r): AssessmentSummary | null => {
      const mapped = mapRemoteAssessmentResult({ results: [r] })
      if (mapped.length === 0) return null
      const parts = mapped.map((m) => (m.source.risk_level ? `${m.domain}: ${m.source.risk_level}` : m.domain))
      return {
        sourceAssessmentId: r.source_assessment_id ?? null,
        profileName: r.profile_ref?.name ?? "NeuRafiki profile",
        completedAt: r.completed_at ?? null,
        areas: Array.from(new Set(mapped.map((m) => m.domain))),
        summary: `Areas reported by NeuRafiki (area: level as NeuRafiki reported it): ${parts.join("; ")}.`,
      }
    })
    .filter((s): s is AssessmentSummary => s !== null)
}
