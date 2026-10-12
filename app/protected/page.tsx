import { redirect } from "next/navigation"

// Superseded by the unified ANDA dashboard; kept so old links still work.
export default function ProtectedPage() {
  redirect("/dashboard")
}
