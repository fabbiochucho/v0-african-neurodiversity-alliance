import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { logAudit } from "@/lib/audit"

// GET /api/learner-records/[id] -- redirects to a 60-second signed URL for
// the record's uploaded file (private bucket; RLS decides who may read).
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const { data: record } = await supabase.from("learner_records").select("file_path").eq("id", params.id).maybeSingle()
  if (!record?.file_path) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data, error } = await supabase.storage.from("learner-files").createSignedUrl(record.file_path, 60)
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.redirect(data.signedUrl)
}

// DELETE /api/learner-records/[id] -- owner removes a record and its file.
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const { data, error } = await supabase.from("learner_records").delete().eq("id", params.id).select("file_path, learner_id")
  if (error) return dbErrorResponse(error)
  if (!data || data.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const paths = data.map((r) => r.file_path).filter((p): p is string => Boolean(p))
  if (paths.length > 0) await supabase.storage.from("learner-files").remove(paths)
  await logAudit({ actorId: user.id, action: "delete", resource: "learner record deleted", learnerId: data[0].learner_id })
  return NextResponse.json({ ok: true })
}
