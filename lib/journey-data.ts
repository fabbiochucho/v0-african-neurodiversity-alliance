import type { SupabaseClient } from "@supabase/supabase-js"
import type { LearnerProfile } from "@/lib/types/iep"
import type { JourneyIEP, JourneyInput, JourneyReport, JourneySnapshot } from "@/lib/journey"

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

  const [{ data: ieps }, { data: reports }, { data: summaries }] = await Promise.all([
    supabase
      .from("ieps")
      .select(
        "id, learner_id, title, status, created_at, custom_goals, iep_goals(id, goal_text, domain, status, created_at, updated_at, progress_logs(id, rating, notes, logged_date, created_at))",
      )
      .in("learner_id", ids)
      .order("created_at", { ascending: false }),
    supabase.from("reports").select("id, learner_id, report_type, report_period, created_at").in("learner_id", ids),
    supabase
      .from("progress_summaries")
      .select("id, learner_id, week_start_date, summary_text, domain_progress, created_at")
      .in("learner_id", ids),
  ])

  type WithLearner<T> = T & { learner_id: string }
  const byLearner = <T>(rows: WithLearner<T>[] | null, id: string) => (rows ?? []).filter((r) => r.learner_id === id)

  return learners.map((learner) => ({
    learner,
    input: {
      ieps: byLearner(ieps as WithLearner<JourneyIEP>[] | null, learner.id),
      reports: byLearner(reports as WithLearner<JourneyReport>[] | null, learner.id),
      summaries: byLearner(summaries as WithLearner<JourneySnapshot>[] | null, learner.id),
    },
  }))
}
