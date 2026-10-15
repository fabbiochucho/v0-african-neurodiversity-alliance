// Data export (round 2, PR E). Pure CSV helpers, unit tested.

// Every plan can export its own data (NDPA data portability). The
// Institutional plan adds the organisation-wide view: everyone on your
// learners' support teams (staff, carers, professionals) and their access.
export const PERSONAL_EXPORT_TABLES = ["learners", "goals", "progress", "reports", "records"] as const
export const EXPORT_TABLES = [...PERSONAL_EXPORT_TABLES, "team"] as const
export type ExportTable = (typeof EXPORT_TABLES)[number]

export const EXPORT_COLUMNS: Record<ExportTable, string[]> = {
  learners: ["id", "name", "age", "gender", "country", "diagnosis_domains", "created_at"],
  goals: ["id", "learner_id", "iep_id", "goal_text", "domain", "status", "baseline", "target", "measurement", "target_completion_date", "created_at"],
  progress: ["id", "learner_id", "goal_id", "rating", "notes", "logged_date", "logged_by", "created_at"],
  reports: ["id", "learner_id", "report_type", "report_period", "content", "email_sent", "created_at"],
  records: ["id", "learner_id", "kind", "record_type", "title", "record_date", "author", "fields", "created_at"],
  team: ["id", "learner_id", "learner_name", "invited_email", "role", "permissions", "status", "created_at", "accepted_at"],
}

function cell(value: unknown): string {
  if (value === null || value === undefined) return ""
  let s = Array.isArray(value) ? value.join(";") : typeof value === "object" ? JSON.stringify(value) : String(value)
  // Spreadsheet formula injection guard (OWASP CSV injection).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  return [columns.join(","), ...rows.map((r) => columns.map((c) => cell(r[c])).join(","))].join("\r\n") + "\r\n"
}
