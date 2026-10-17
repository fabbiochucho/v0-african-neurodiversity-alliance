const DEFAULT_APP_URL = "https://anda.becomechange.institute"

// The site's public base URL, for links that leave the app: payment return
// URLs, invite and digest emails, the sitemap. Uses NEXT_PUBLIC_APP_URL only
// when it's a full http(s) URL, so a mistyped setting can't break those
// links; otherwise the fallback (the request's own origin, or the real domain).
export function appUrl(fallback: string = DEFAULT_APP_URL): string {
  try {
    const u = new URL((process.env.NEXT_PUBLIC_APP_URL ?? "").trim())
    if (u.protocol === "https:" || u.protocol === "http:") return u.origin
  } catch {}
  return fallback.replace(/\/$/, "")
}
