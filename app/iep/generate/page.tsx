import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getEntitlement, nextTier } from "@/lib/entitlements"
import type { LearnerProfile } from "@/lib/types/iep"
import { GenerateIEPForm } from "./generate-iep-form"

export default async function GenerateIEPPage({ searchParams }: { searchParams: { learner?: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirectTo=/iep/generate")
  }

  const [entitlement, { data: learners }] = await Promise.all([
    getEntitlement(supabase, user.id),
    supabase.from("learner_profiles").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
  ])

  const existing = (learners ?? []) as LearnerProfile[]

  // The learner cap only applies to adding a *new* person; anyone can start
  // another plan for someone they already support.
  return (
    <GenerateIEPForm
      learners={existing}
      initialLearnerId={existing.some((l) => l.id === searchParams.learner) ? searchParams.learner : undefined}
      canAddLearner={existing.length < entitlement.learnerLimit}
      learnerLimit={entitlement.learnerLimit}
      upgradeTier={nextTier(entitlement.tier)}
    />
  )
}
