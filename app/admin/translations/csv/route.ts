import { NextResponse } from "next/server"
import { staffForApi } from "@/lib/admin"
import { allTranslations, toCsv } from "@/lib/i18n/review"

// Download every string for a translator to review in a spreadsheet.
export async function GET() {
  const staff = await staffForApi("translations.manage")
  if (staff instanceof NextResponse) return staff
  return new NextResponse(toCsv(allTranslations()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="anda-translations.csv"',
    },
  })
}
