// PII is masked in the admin panel by default. Revealing it needs users.reveal_pii and is logged.

/** "amina.bello@example.org" -> "am•••@example.org" */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return ""
  const [local, domain] = email.split("@")
  if (!domain) return "•••"
  return `${local.slice(0, Math.min(2, local.length))}•••@${domain}`
}

/** "Amina Bello" -> "A. B." */
export function maskName(first: string | null | undefined, last: string | null | undefined): string {
  return [first, last]
    .filter(Boolean)
    .map((n) => `${n!.trim().charAt(0).toUpperCase()}.`)
    .join(" ")
}

export function csvCell(v: unknown): string {
  const s = v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v)
  // Quote everything; neutralise spreadsheet formulas.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`
}

export function toCsv(cols: string[], rows: Record<string, unknown>[]): string {
  return [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\r\n")
}
