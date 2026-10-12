import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getEntitlement } from "@/lib/entitlements"
import { ReportsClient } from "./reports-client"

export default async function IEPReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const entitlement = await getEntitlement(supabase, user.id)

  return <ReportsClient canGenerate={entitlement.can("reports")} canEmail={entitlement.can("email_reports")} />
}
