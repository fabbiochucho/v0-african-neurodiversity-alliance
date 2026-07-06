import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="space-y-8">
          <div className="bg-card rounded-lg border border-border p-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome, {profile?.first_name}!</h1>
            <p className="text-muted-foreground text-lg">Your ANDA dashboard is ready</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/iep/dashboard"
              className="p-6 bg-card border border-border rounded-lg hover:border-[#3C9C87] transition space-y-2"
            >
              <h3 className="font-semibold text-foreground">IEP Dashboard</h3>
              <p className="text-sm text-muted-foreground">View and manage your IEPs</p>
            </Link>

            <Link
              href="/iep/generate"
              className="p-6 bg-card border border-border rounded-lg hover:border-[#3C9C87] transition space-y-2"
            >
              <h3 className="font-semibold text-foreground">Create IEP</h3>
              <p className="text-sm text-muted-foreground">Generate a new IEP</p>
            </Link>

            <Link
              href="/iep/progress"
              className="p-6 bg-card border border-border rounded-lg hover:border-[#3C9C87] transition space-y-2"
            >
              <h3 className="font-semibold text-foreground">Track Progress</h3>
              <p className="text-sm text-muted-foreground">Log and view progress</p>
            </Link>

            <Link
              href="/settings/connections"
              className="p-6 bg-card border border-border rounded-lg hover:border-[#3C9C87] transition space-y-2"
            >
              <h3 className="font-semibold text-foreground">Connected Accounts</h3>
              <p className="text-sm text-muted-foreground">Link your Neu Rafiki account</p>
            </Link>
          </div>

          <form
            action={async () => {
              "use server"
              const supabase = await createClient()
              await supabase.auth.signOut()
              redirect("/auth/login")
            }}
          >
            <button
              type="submit"
              className="py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
