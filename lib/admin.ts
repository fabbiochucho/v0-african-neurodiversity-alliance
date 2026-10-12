import { createClient } from "@/lib/supabase/server"

// Admins are listed by email in ADMIN_EMAILS (comma-separated). There is no
// admin role in the database yet; this gates the feed moderation page only.
export async function getAdminEmail(): Promise<string | null> {
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  if (!allowed.length) return null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email?.toLowerCase()
  return email && allowed.includes(email) ? email : null
}
