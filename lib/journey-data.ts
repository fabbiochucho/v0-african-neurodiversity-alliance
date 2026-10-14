import type { SupabaseClient } from "@supabase/supabase-js"
import type { LearnerProfile } from "@/lib/types/iep"
import { isOfficialGoal, type JourneyIEP, type JourneyInput, type JourneyRecord, type JourneyReport, type JourneySnapshot } from "@/lib/journey"

export interface PersonJourney {
  learner: LearnerProfile
  input: JourneyInput
}

/**
 * Loads everything "My Journey" needs for the given learners in three
 * queries (not one round-trip per learner). RLS decides what the caller
 * may see.
 */
export async function loadJourneys(supabase: SupabaseClient, learners: LearnerProfile[]): Promise<PersonJourney[]> {
  const ids = learners.map((l) => l.id)
  if (ids.length === 0) return []

  const [{ data: ieps }, { data: reports }, { data: summaries }, { data: records }] = await Promise.all([
    supabase
      .from("ieps")
      .select(
        "id, learner_id, title, status, created_at, custom_goals, iep_goals(*, progress_logs(id, rating, notes, logged_date, created_at))",
      )
      .in("learner_id", ids)
      .order("created_at", { ascending: false }),
    supabase.from("reports").select("id, learner_id, report_type, report_period, created_at").in("learner_id", ids),
    supabase
      .from("progress_summaries")
      .select("id, learner_id, week_start_date, summary_text, domain_progress, created_at")
      .in("learner_id", ids),
    // Missing table (042 not applied yet) just yields no records.
    supabase
      .from("learner_records")
      .select("id, learner_id, kind, record_type, title, record_date, fields, created_at")
      .in("learner_id", ids),
  ])

  type WithLearner<T> = T & { learner_id: string }
  const byLearner = <T>(rows: WithLearner<T>[] | null, id: string) => (rows ?? []).filter((r) => r.learner_id === id)

  return learners.map((learner) => ({
    learner,
    input: {
      // Only the official plan: drafts, suggestions and rejected items (045) are excluded.
      ieps: byLearner(ieps as WithLearner<JourneyIEP>[] | null, learner.id).map((iep) => ({
        ...iep,
        iep_goals: (iep.iep_goals ?? []).filter((g) => isOfficialGoal(g)),
      })),
      reports: byLearner(reports as WithLearner<JourneyReport>[] | null, learner.id),
      summaries: byLearner(summaries as WithLearner<JourneySnapshot>[] | null, learner.id),
      records: byLearner(records as WithLearner<JourneyRecord>[] | null, learner.id),
    },
  }))
}
