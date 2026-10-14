import { redirect } from "next/navigation"

// Replaced by the unified, person-centred dashboard (and each person's /journey page).
export default function IEPDashboardPage() {
  redirect("/dashboard")
}
