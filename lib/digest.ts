import { Resend } from "resend"

export const DIGEST_FROM = process.env.RESEND_FROM_EMAIL || "ANDA <noreply@anda.becomechange.institute>"

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://anda.becomechange.institute").replace(/\/$/, "")
}

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  return key ? new Resend(key) : null
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export interface DigestContent {
  news: { title: string; url: string; source: string | null; country: string | null }[]
  research: { title: string; url: string; journal: string | null; scope: string }[]
  resources: { name: string; country: string | null; url: string | null }[]
}

export function isDigestEmpty(c: DigestContent): boolean {
  return !c.news.length && !c.research.length && !c.resources.length
}

function section(heading: string, rows: string[]): string {
  if (!rows.length) return ""
  return `<h2 style="font-size:18px;margin:28px 0 8px;color:#2A7A69">${heading}</h2><ul style="padding-left:18px;margin:0">${rows.join("")}</ul>`
}

function li(title: string, url: string | null, meta: string): string {
  const t = escapeHtml(title)
  const link = url && /^https?:\/\//i.test(url) ? `<a href="${escapeHtml(url)}" style="color:#1e2a27">${t}</a>` : t
  return `<li style="margin:0 0 10px">${link}${meta ? `<br><span style="color:#5b6b67;font-size:13px">${escapeHtml(meta)}</span>` : ""}</li>`
}

export function digestHtml(c: DigestContent, unsubscribeUrl: string): string {
  const base = appUrl()
  return `<!doctype html><html><body style="margin:0;background:#f5f8f7;font-family:Arial,Helvetica,sans-serif;color:#1e2a27">
<div style="max-width:600px;margin:0 auto;padding:24px 16px">
<p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#2A7A69;font-weight:bold;margin:0">Africa NeuroDiversity Alliance</p>
<h1 style="font-size:24px;margin:4px 0 0">This week in neurodiversity</h1>
${section(
  "News from across Africa",
  c.news.map((n) => li(n.title, n.url, [n.source, n.country].filter(Boolean).join(" · "))),
)}
${section(
  "New open-access research",
  c.research.map((r) => li(r.title, r.url, [r.journal, r.scope === "africa" ? "African authors" : "Worldwide"].filter(Boolean).join(" · "))),
)}
${section(
  "New in the Find Support directory",
  c.resources.map((r) => li(r.name, r.url, r.country ?? "")),
)}
<p style="margin:32px 0 0;font-size:14px"><a href="${base}/news" style="color:#2A7A69">See all news and research on ANDA</a></p>
<p style="margin:24px 0 0;font-size:12px;color:#5b6b67">News headlines link to the original publishers, including allAfrica.com. You're getting this because you subscribed on ${escapeHtml(base.replace(/^https?:\/\//, ""))}. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#5b6b67">Unsubscribe</a>.</p>
</div></body></html>`
}

export function confirmHtml(confirmUrl: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f8f7;font-family:Arial,Helvetica,sans-serif;color:#1e2a27">
<div style="max-width:600px;margin:0 auto;padding:24px 16px">
<h1 style="font-size:22px">Confirm your ANDA weekly digest</h1>
<p>Click below to start getting a weekly email with neurodiversity news from across Africa, new open-access research and new support organisations.</p>
<p><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:#2A7A69;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">Confirm subscription</a></p>
<p style="font-size:12px;color:#5b6b67">If you didn't ask for this, ignore this email and you won't be subscribed.</p>
</div></body></html>`
}
