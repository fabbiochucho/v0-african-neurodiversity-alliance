"use client"

import { Analytics as VercelAnalytics } from "@vercel/analytics/next"

// Page URLs can carry a condition filter (?condition=autism) or a person's
// record id. Analytics only needs the page, so send neither.
export function scrubUrl(url: string): string {
  const u = new URL(url)
  return u.origin + u.pathname.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "[id]")
}

export function Analytics() {
  return <VercelAnalytics beforeSend={(event) => ({ ...event, url: scrubUrl(event.url) })} />
}
