import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { DISCLAIMER } from "@/lib/companion"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { CompanionChat } from "./companion-chat"

export default async function CompanionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/companion")

  const entitlement = await getEntitlement(supabase, user.id)
  const configured = Boolean(process.env.ANTHROPIC_API_KEY)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <header>
            <h1 className="text-4xl font-bold text-balance mb-2">AI Companion</h1>
            <p className="text-muted-foreground">
              Talk through routines, communication, school goals and next steps. Beta.
            </p>
          </header>

          <p role="note" className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            {DISCLAIMER} Conversations aren&apos;t saved: closing or refreshing this page clears them.
          </p>

          {!entitlement.can("ai_companion") ? (
            <UpgradePrompt
              message="Get practical, everyday support ideas from ANDA's AI Companion."
              requiredTier={FEATURE_MIN_TIER.ai_companion}
            />
          ) : !configured ? (
            <p className="text-muted-foreground">The AI Companion isn&apos;t switched on yet. Please check back soon.</p>
          ) : (
            <CompanionChat />
          )}
        </div>
      </main>
    </div>
  )
}
