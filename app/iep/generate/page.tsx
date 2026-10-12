import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { getEntitlement, nextTier } from "@/lib/entitlements"
import { GenerateIEPForm } from "./generate-iep-form"

export default async function GenerateIEPPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const entitlement = await getEntitlement(supabase, user.id)
  const { count } = await supabase
    .from("learner_profiles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  if ((count ?? 0) >= entitlement.learnerLimit) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
          <h1 className="text-4xl font-bold text-balance mb-6">Generate Personalized IEP</h1>
          <UpgradePrompt
            message={`Your plan includes ${entitlement.learnerLimit} learner profile${
              entitlement.learnerLimit === 1 ? "" : "s"
            }, and you're using all of them.`}
            requiredTier={nextTier(entitlement.tier)}
          />
        </div>
      </div>
    )
  }

  return <GenerateIEPForm />
}
