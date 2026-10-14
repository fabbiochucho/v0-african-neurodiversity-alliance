// Custom branding for reports and report emails (round 2, PR E).
import type { SupabaseClient } from "@supabase/supabase-js"
import { getEntitlement } from "@/lib/entitlements"

export interface Branding {
  orgName: string | null
  accentColor: string | null
  logoUrl: string | null
}

export const LOGO_TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }
export const LOGO_MAX_BYTES = 512 * 1024

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio of white text on the given colour. */
export function contrastWithWhite(hex: string): number {
  return 1.05 / (luminance(hex) + 0.05)
}

/**
 * Accent colours are used as the background behind white header text in
 * report emails, so they must reach WCAG AA (4.5:1) against white.
 */
export function validateAccent(value: unknown): { ok: true; color: string } | { ok: false; error: string } {
  if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) {
    return { ok: false, error: "Pick a colour in #RRGGBB format." }
  }
  const ratio = contrastWithWhite(value)
  if (ratio < 4.5) {
    return { ok: false, error: `That colour is too light for white text (contrast ${ratio.toFixed(1)}:1, needs 4.5:1). Try a darker shade.` }
  }
  return { ok: true, color: value.toLowerCase() }
}

/** The caller's branding, or null if they have none or their plan doesn't include it. */
export async function getBranding(supabase: SupabaseClient, userId: string): Promise<Branding | null> {
  if (!(await getEntitlement(supabase, userId)).can("branding")) return null
  const { data } = await supabase.from("branding_settings").select("org_name, accent_color, logo_path").eq("user_id", userId).maybeSingle()
  if (!data) return null
  return {
    orgName: data.org_name,
    accentColor: data.accent_color,
    logoUrl: data.logo_path ? supabase.storage.from("branding").getPublicUrl(data.logo_path).data.publicUrl : null,
  }
}
