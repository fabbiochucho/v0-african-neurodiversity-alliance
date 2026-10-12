// Bulk enrollment from CSV (round 2, PR E). Pure functions, unit tested.
import { DIAGNOSIS_DOMAINS } from "@/lib/constants/iep"
import type { DiagnosisDomain } from "@/lib/types/iep"

export const BULK_COLUMNS = ["name", "age", "gender", "country", "support_areas"] as const
export const BULK_MAX_ROWS = 500

export const CSV_TEMPLATE = `${BULK_COLUMNS.join(",")}
"Example Learner",9,Female,Kenya,ADHD;Dyslexia
`

/** RFC 4180-style parser: quoted fields, escaped quotes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"' && field === "") quoted = true
    else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else field += c
  }
  if (field !== "" || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""))
}

export interface BulkLearner {
  name: string
  age: number | null
  gender: string | null
  country: string | null
  diagnosis_domains: DiagnosisDomain[]
}

export interface BulkReport {
  valid: { row: number; learner: BulkLearner }[]
  errors: { row: number; message: string }[]
}

/**
 * Validates every row (row numbers are spreadsheet rows: header = 1) and
 * marks rows beyond the plan's remaining learner capacity as errors.
 */
export function validateBulk(text: string, remainingCapacity: number): BulkReport {
  const rows = parseCsv(text.replace(/^﻿/, ""))
  const report: BulkReport = { valid: [], errors: [] }
  if (rows.length === 0) return { valid: [], errors: [{ row: 1, message: "The file is empty." }] }

  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = Object.fromEntries(BULK_COLUMNS.map((c) => [c, header.indexOf(c)])) as Record<(typeof BULK_COLUMNS)[number], number>
  if (idx.name < 0) return { valid: [], errors: [{ row: 1, message: `Missing a "name" column. Use the template's header row.` }] }
  if (rows.length - 1 > BULK_MAX_ROWS) {
    return { valid: [], errors: [{ row: 1, message: `Too many rows (${rows.length - 1}). The limit is ${BULK_MAX_ROWS} per file.` }] }
  }

  rows.slice(1).forEach((cells, i) => {
    const rowNo = i + 2
    const get = (c: (typeof BULK_COLUMNS)[number]) => (idx[c] >= 0 ? (cells[idx[c]] ?? "").trim() : "")
    const problems: string[] = []

    const name = get("name")
    if (!name) problems.push("name is required")
    else if (name.length > 100) problems.push("name is longer than 100 characters")

    let age: number | null = null
    const ageRaw = get("age")
    if (ageRaw) {
      age = Number(ageRaw)
      if (!Number.isInteger(age) || age < 0 || age > 120) problems.push(`age "${ageRaw}" must be a whole number from 0 to 120`)
    }

    const areas: DiagnosisDomain[] = []
    for (const raw of get("support_areas").split(";").map((s) => s.trim()).filter(Boolean)) {
      const match = DIAGNOSIS_DOMAINS.find((d) => d.toLowerCase() === raw.toLowerCase())
      if (match) {
        if (!areas.includes(match)) areas.push(match)
      } else problems.push(`unknown support area "${raw}" (use ${DIAGNOSIS_DOMAINS.join(", ")})`)
    }

    if (problems.length > 0) {
      report.errors.push({ row: rowNo, message: problems.join("; ") })
    } else if (report.valid.length >= remainingCapacity) {
      report.errors.push({ row: rowNo, message: "over your plan's learner limit, not added" })
    } else {
      report.valid.push({
        row: rowNo,
        learner: { name, age, gender: get("gender").slice(0, 40) || null, country: get("country").slice(0, 80) || null, diagnosis_domains: areas },
      })
    }
  })

  return report
}
