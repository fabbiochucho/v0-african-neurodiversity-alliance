import { describe, expect, it } from "vitest"
import { allTranslations, toCsv } from "@/lib/i18n/review"

describe("translation review export", () => {
  it("has a French and Portuguese draft for every string", () => {
    const rows = allTranslations()
    expect(rows.length).toBeGreaterThan(300)
    expect(rows.filter((r) => !r.fr || !r.pt).map((r) => r.key)).toEqual([])
  })

  it("writes spreadsheet-safe CSV", () => {
    const csv = toCsv([{ key: "k", en: 'Say "hi", ok', fr: "à", pt: "" }])
    expect(csv.startsWith("﻿key,english,french,portuguese,french_corrected,portuguese_corrected\r\n")).toBe(true)
    expect(csv).toContain('"k","Say ""hi"", ok","à","","",""')
  })
})
