// Server-side loader for the full IEP flow (RLS decides what's visible).
import type { SupabaseClient } from "@supabase/supabase-js"
import type { SupportProfile } from "@/lib/learner-records"

export interface PlanGoal {
  id: string
  goal_text: string
  domain: string | null
  status: string
  baseline: string | null
  target: string | null
  measurement: string | null
  frequency: string | null
  responsible_person: string | null
  support_strategy: string | null
  review_date: string | null
  evidence: string | null
  source: string
  approval_status: string
  approved_at: string | null
}

export interface PlanItem {
  id: string
  section: string
  content: string
  source: string
  status: string
  edited: boolean
  approved_at: string | null
}

export async function loadPlan(supabase: SupabaseClient, learnerId: string, userId: string) {
  const { data: learner } = await supabase
    .from("learner_profiles")
    .select("*")
    .eq("id", learnerId)
    .maybeSingle()
  if (!learner) return null

  const perm = async (p: string) =>
    learner.user_id === userId || (await supabase.rpc("has_permission", { p_learner_id: learnerId, p_perm: p })).data === true

  const [{ data: ieps }, { data: records }, { data: team }, approve, manage, suggest] = await Promise.all([
    supabase.from("ieps").select("id, title, status, created_at").eq("learner_id", learnerId).order("created_at", { ascending: false }).limit(1),
    supabase
      .from("learner_records")
      .select("id, kind, record_type, title, fields, created_at")
      .eq("learner_id", learnerId)
      .order("created_at", { ascending: false }),
    supabase.from("support_team_members").select("id, invited_email, role, status").eq("learner_id", learnerId),
    perm("approve"),
    perm("manage_plan"),
    perm("suggest_goal"),
  ])

  const iep = ieps?.[0] ?? null
  const [{ data: goals }, { data: items }, { data: versions }] = iep
    ? await Promise.all([
        supabase.from("iep_goals").select("*").eq("iep_id", iep.id).order("created_at"),
        supabase.from("iep_plan_items").select("id, section, content, source, status, edited, approved_at").eq("iep_id", iep.id).order("created_at"),
        supabase.from("iep_plan_versions").select("id, version, approved_at").eq("iep_id", iep.id).order("version", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  const profileRow = (records ?? []).find((r) => r.record_type === "support_profile")
  return {
    learner,
    isOwner: learner.user_id === userId,
    can: { approve, manage, suggest },
    iep,
    goals: ((goals ?? []) as PlanGoal[]).map((g) => ({ ...g, source: g.source ?? "person", approval_status: g.approval_status ?? "approved" })),
    items: (items ?? []) as PlanItem[],
    versions: versions ?? [],
    profile: (profileRow?.fields ?? null) as SupportProfile | null,
    neurafiki: (records ?? []).filter((r) => r.kind === "assessment"),
    team: team ?? [],
  }
}

export type LoadedPlan = NonNullable<Awaited<ReturnType<typeof loadPlan>>>
