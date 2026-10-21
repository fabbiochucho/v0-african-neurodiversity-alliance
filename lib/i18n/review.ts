import { translationTable } from "@/lib/i18n"
import { PATHWAYS } from "@/lib/pathways"
import { fr as pathwaysFr, pt as pathwaysPt } from "@/lib/i18n/messages/pathways"

export type TranslationRow = { key: string; en: string; fr: string; pt: string }

/** All site strings plus the pathway text, for the reviewer page and CSV. */
export function allTranslations(): TranslationRow[] {
  const rows: TranslationRow[] = translationTable()
  for (const p of PATHWAYS) {
    const add = (k: string, en: string) =>
      rows.push({ key: `pathways.${k}`, en, fr: pathwaysFr[k] ?? "", pt: pathwaysPt[k] ?? "" })
    add(`${p.slug}.title`, p.title)
    add(`${p.slug}.intro`, p.intro)
    p.steps.forEach((s, i) => {
      add(`${p.slug}.${i}.label`, s.label)
      add(`${p.slug}.${i}.detail`, s.detail)
    })
  }
  return rows
}

/** RFC 4180 CSV with a UTF-8 BOM so Excel shows accents correctly. */
export function toCsv(rows: TranslationRow[]): string {
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = [["key", "english", "french", "portuguese", "french_corrected", "portuguese_corrected"].join(",")]
  for (const r of rows) lines.push([r.key, r.en, r.fr, r.pt, "", ""].map(cell).join(","))
  return "﻿" + lines.join("\r\n") + "\r\n"
}
