import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { isEducationContext, LANGUAGES, t } from "@/lib/i18n"
import { logAudit } from "@/lib/audit"

// PATCH /api/learners/[id]/settings { country, region, language, education_context }
// Owner only (learner_profiles_update_own). Terminology only; no legal meaning.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null)
  if (!isEducationContext(body.education_context)) return NextResponse.json({ error: "Choose an education context." }, { status: 400 })
  if (!LANGUAGES.some((l) => l.code === body.language)) return NextResponse.json({ error: "Choose a language." }, { status: 400 })

  const { data, error } = await supabase
    .from("learner_profiles")
    .update({
      country: text(body.country, 80),
      region: text(body.region, 100),
      language: body.language,
      education_context: body.education_context,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("id")
  if (error) return dbErrorResponse(error)
  if (!data?.length) return NextResponse.json({ error: t("state.saveFailed") }, { status: 404 })

  await logAudit({ actorId: user.id, ownerId: user.id, learnerId: params.id, action: "change", resource: "localisation settings changed" })
  return NextResponse.json({ ok: true })
}
