import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { getEntitlement, nextTier } from "@/lib/entitlements"
import { logAudit } from "@/lib/audit"
import {
  ASSESSMENT_FILE_MAX_BYTES,
  ASSESSMENT_FILE_TYPES,
  parseExistingAssessment,
  parseSupportProfile,
} from "@/lib/learner-records"

// POST /api/learner-records (multipart/form-data)
//   record=support_profile: learner_id OR (new_name, new_age, new_country),
//                           plus the support profile fields
//   record=assessment:      learner_id, record_type, record_date, author,
//                           title, summary, file (optional PDF/PNG/JPEG <= 10 MB)
// RLS (scripts/042) limits inserts to the caller's own learners, the
// 'observation'/'professional_input' kinds, and their own Storage folder.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await request.formData()
  const raw = Object.fromEntries(Array.from(form.entries()).filter(([, v]) => typeof v === "string")) as Record<string, string>
  let learnerId = raw.learner_id || null

  if (raw.record === "support_profile") {
    const profile = parseSupportProfile(raw)
    if (!profile) return NextResponse.json({ error: "Fill in at least one section (each up to 2000 characters)." }, { status: 400 })

    if (!learnerId) {
      const name = (raw.new_name ?? "").trim().slice(0, 100)
      if (!name) return NextResponse.json({ error: "Add their name or a nickname." }, { status: 400 })

      const entitlement = await getEntitlement(supabase, user.id)
      const { count } = await supabase.from("learner_profiles").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      if ((count ?? 0) >= entitlement.learnerLimit) {
        return upgradeRequiredResponse(
          `Your plan includes ${entitlement.learnerLimit} learner profile${entitlement.learnerLimit === 1 ? "" : "s"}.`,
          nextTier(entitlement.tier),
        )
      }

      const age = Number.parseInt(raw.new_age ?? "", 10)
      const { data: learner, error } = await supabase
        .from("learner_profiles")
        .insert({
          user_id: user.id,
          name,
          age: Number.isInteger(age) && age >= 0 && age <= 120 ? age : null,
          country: (raw.new_country ?? "").trim().slice(0, 80) || null,
          diagnosis_domains: [],
        })
        .select("id")
        .single()
      if (error) return dbErrorResponse(error)
      learnerId = learner.id
    }

    const { error } = await supabase.from("learner_records").insert({
      learner_id: learnerId,
      created_by: user.id,
      kind: "observation",
      record_type: "support_profile",
      title: "Support profile",
      fields: profile,
    })
    if (error) return dbErrorResponse(error)
    await logAudit({ actorId: user.id, action: "change", resource: "support profile added", learnerId })
    return NextResponse.json({ ok: true, learner_id: learnerId }, { status: 201 })
  }

  if (raw.record === "assessment") {
    if (!learnerId) return NextResponse.json({ error: "learner_id is required" }, { status: 400 })
    const parsed = parseExistingAssessment(raw)
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })

    let filePath: string | null = null
    const file = form.get("file")
    if (file instanceof File && file.size > 0) {
      const ext = ASSESSMENT_FILE_TYPES[file.type]
      if (!ext) return NextResponse.json({ error: "Files must be PDF, PNG or JPEG." }, { status: 400 })
      if (file.size > ASSESSMENT_FILE_MAX_BYTES) return NextResponse.json({ error: "Files must be 10 MB or smaller." }, { status: 400 })
      filePath = `${user.id}/${learnerId}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from("learner-files").upload(filePath, file, { contentType: file.type })
      if (uploadError) return dbErrorResponse(uploadError)
    }

    const { error } = await supabase.from("learner_records").insert({
      learner_id: learnerId,
      created_by: user.id,
      kind: "professional_input",
      record_type: parsed.record_type,
      title: parsed.title,
      record_date: parsed.record_date,
      author: parsed.author,
      fields: { summary: parsed.summary },
      file_path: filePath,
    })
    if (error) {
      if (filePath) await supabase.storage.from("learner-files").remove([filePath])
      return dbErrorResponse(error)
    }
    await logAudit({ actorId: user.id, action: "change", resource: "assessment added", learnerId })
    return NextResponse.json({ ok: true, learner_id: learnerId }, { status: 201 })
  }

  return NextResponse.json({ error: "Unknown record" }, { status: 400 })
}
