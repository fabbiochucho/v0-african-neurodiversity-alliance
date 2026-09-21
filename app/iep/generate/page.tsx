import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GenerateIEPForm } from "./generate-iep-form"

export default async function GenerateIEPPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <GenerateIEPForm />
}
