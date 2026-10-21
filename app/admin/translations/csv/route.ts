import { NextResponse } from "next/server"
import { getAdminEmail } from "@/lib/admin"
import { allTranslations, toCsv } from "@/lib/i18n/review"

// Download every string for a translator to review in a spreadsheet.
export async function GET() {
  if (!(await getAdminEmail())) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(toCsv(allTranslations()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="anda-translations.csv"',
    },
  })
}
