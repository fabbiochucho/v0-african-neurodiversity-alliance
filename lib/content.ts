// Blog posts, news, training and announcements written on /admin/content (scripts/060).

export const CONTENT_KINDS = {
  blog: "Blog",
  news: "News",
  training: "Training",
  announcement: "Announcement",
} as const
export type ContentKind = keyof typeof CONTENT_KINDS
export const isContentKind = (k: unknown): k is ContentKind => typeof k === "string" && k in CONTENT_KINDS

export interface ContentItem {
  id: string
  kind: ContentKind
  slug: string
  title: string
  summary: string
  body: string
  cover_image_url: string | null
  external_url: string | null
  status: "draft" | "published" | "archived"
  published_at: string | null
  author_email: string
  updated_at: string
}

export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "")
}

export type Block =
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; lines: string[] }

/** Same plain-text format as the newsletter: blank lines, "## " headings, "- " lists. */
export function parseBody(body: string): Block[] {
  const out: Block[] = []
  for (const raw of body.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = raw.trim().split("\n").filter(Boolean)
    if (!lines.length) continue
    if (lines[0].startsWith("## ")) {
      out.push({ type: "heading", text: lines[0].slice(3) })
      lines.shift()
      if (!lines.length) continue
    }
    if (lines.every((l) => l.startsWith("- "))) out.push({ type: "list", items: lines.map((l) => l.slice(2)) })
    else out.push({ type: "paragraph", lines })
  }
  return out
}

/** Splits text into plain parts and https links, for rendering as React elements (no HTML strings). */
export function linkParts(text: string): { text: string; href?: string }[] {
  const parts: { text: string; href?: string }[] = []
  let last = 0
  for (const m of text.matchAll(/https:\/\/[^\s<]+[^\s<.,;:!?)]/g)) {
    if (m.index! > last) parts.push({ text: text.slice(last, m.index) })
    parts.push({ text: m[0], href: m[0] })
    last = m.index! + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last) })
  return parts
}
