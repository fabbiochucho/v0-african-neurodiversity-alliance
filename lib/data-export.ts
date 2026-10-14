// Data export (round 2, PR E). Pure CSV helpers, unit tested.

export const EXPORT_TABLES = ["learners", "goals", "progress", "reports"] as const
export type ExportTable = (typeof EXPORT_TABLES)[number]

export const EXPORT_COLUMNS: Record<ExportTable, string[]> = {
  learners: ["id", "name", "age", "gender", "country", "diagnosis_domains", "created_at"],
  goals: ["id", "learner_id", "iep_id", "goal_text", "domain", "status", "baseline", "target", "measurement", "target_completion_date", "created_at"],
  progress: ["id", "learner_id", "goal_id", "rating", "notes", "logged_date", "logged_by", "created_at"],
  reports: ["id", "learner_id", "report_type", "report_period", "content", "email_sent", "created_at"],
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
