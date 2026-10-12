import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { LOGO_MAX_BYTES, LOGO_TYPES, validateAccent } from "@/lib/branding"

// POST /api/branding (multipart/form-data): org_name, accent_color,
// logo (optional PNG/JPEG/WebP <= 512 KB), remove_logo ("1").
// Storage + table RLS (scripts/035) also restrict writes to the owner's own
// folder/row and to Pro+.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!(await getEntitlement(supabase, user.id)).can("branding")) {
    return upgradeRequiredResponse("Custom branding is part of the Pro plan.", FEATURE_MIN_TIER.branding)
  }

  const form = await request.formData()
  const orgName = String(form.get("org_name") ?? "").trim().slice(0, 120) || null
  const accentRaw = String(form.get("accent_color") ?? "").trim()
  let accent: string | null = null
  if (accentRaw) {
    const checked = validateAccent(accentRaw)
    if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 })
    accent = checked.color
  }

  const { data: current } = await supabase.from("branding_settings").select("logo_path").eq("user_id", user.id).maybeSingle()
  let logoPath: string | null = current?.logo_path ?? null

  const logo = form.get("logo")
  if (logo instanceof File && logo.size > 0) {
    const ext = LOGO_TYPES[logo.type]
    if (!ext) return NextResponse.json({ error: "Logo must be a PNG, JPEG or WebP image." }, { status: 400 })
    if (logo.size > LOGO_MAX_BYTES) return NextResponse.json({ error: "Logo must be 512 KB or smaller." }, { status: 400 })

    // Versioned name so email clients don't show a cached old logo.
    const path = `${user.id}/logo-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from("branding").upload(path, logo, { contentType: logo.type })
    if (uploadError) return dbErrorResponse(uploadError)
    if (logoPath) await supabase.storage.from("branding").remove([logoPath])
    logoPath = path
  } else if (form.get("remove_logo") === "1" && logoPath) {
    await supabase.storage.from("branding").remove([logoPath])
    logoPath = null
  }

  const { error } = await supabase
    .from("branding_settings")
    .upsert({ user_id: user.id, org_name: orgName, accent_color: accent, logo_path: logoPath, updated_at: new Date().toISOString() })
  if (error) return dbErrorResponse(error)

  return NextResponse.json({ ok: true })
}
