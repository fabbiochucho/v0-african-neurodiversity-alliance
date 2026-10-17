import { notFound, redirect } from "next/navigation"
import { aiProvider } from "@/lib/ai"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { getEntitlement } from "@/lib/entitlements"
import { hasActiveConsent } from "@/lib/companion"
import { loadPlan } from "@/lib/plan-data"
import { firstOpenStep } from "@/lib/iep-plan"
import { PlanFlow } from "./plan-flow"
import { termsFor } from "@/lib/i18n"

// The full IEP (brief §18-19): a 12-step conversational flow that starts
// at the first thing we don't already know.
export default async function PlanPage(props: { params: Promise<{ learnerId: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirectTo=/plan/${params.learnerId}`)

  const plan = await loadPlan(supabase, params.learnerId, user.id)
  if (!plan) notFound()

  const [entitlement, { data: consentEvents }] = await Promise.all([
    getEntitlement(supabase, user.id),
    supabase.from("ai_learner_consent_events").select("action, consent_version, created_at").eq("learner_id", plan.learner.id).eq("user_id", user.id),
  ])

  const approvedGoals = plan.goals.filter((g) => g.approval_status === "approved")
  const drafts = plan.goals.filter((g) => g.approval_status === "draft" || g.approval_status === "suggested").length +
    plan.items.filter((i) => i.status === "draft" || i.status === "suggested").length
  const facts = {
    learner: { name: plan.learner.name, age: plan.learner.age, country: plan.learner.country },
    profile: plan.profile,
    approvedGoalCount: approvedGoals.length,
    teamCount: plan.team.length,
    draftCount: drafts,
    versionCount: plan.versions.length,
  }

  const ai = {
    configured: aiProvider() !== null,
    entitled: entitlement.can("ai_companion"),
    consented: plan.isOwner && hasActiveConsent(consentEvents ?? []),
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PlanFlow plan={JSON.parse(JSON.stringify(plan))} facts={facts} startAt={firstOpenStep(facts)} ai={ai}
          planLabel={termsFor(plan.learner.education_context).planShort}
          disclaimer={termsFor(plan.learner.education_context).disclaimer}
        />
      </main>
    </div>
  )
}
