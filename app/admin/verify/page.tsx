import { notFound, redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { staffRole } from "@/lib/admin"
import { AdminVerify } from "./verify-form"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin sign-in | ANDA", robots: { index: false } }

export default async function AdminVerifyPage() {
  const who = await staffRole()
  if (!who) redirect("/auth/login?redirectTo=/admin")
  if (!who.role) notFound()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto max-w-md px-4 py-16 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Admin sign-in</h1>
          <p className="text-muted-foreground">
            The admin panel needs a code from an authenticator app (such as Google Authenticator, Microsoft
            Authenticator or 1Password) every time you sign in, and again after 30 minutes without activity.
          </p>
        </header>
        <AdminVerify />
      </main>
    </div>
  )
}
