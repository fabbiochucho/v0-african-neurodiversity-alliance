import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { SupportProfileForm } from "@/components/support-profile-form"

// Brief §7: start in ANDA without a NeuRafiki assessment.
export default async function NewSupportProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/people/new")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-2xl space-y-6">
        <header>
          <h1 className="text-4xl font-bold mb-2">Create a support profile</h1>
          <p className="text-muted-foreground">
            Describe the person you support in your own words. You don&apos;t need an assessment to start, and you can add
            an existing diagnosis or plan afterwards.
          </p>
        </header>
        <SupportProfileForm />
      </main>
    </div>
  )
}
