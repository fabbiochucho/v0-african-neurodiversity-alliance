import Link from "next/link"
import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { getAdminEmail } from "@/lib/admin"
import { REVIEWED_LANGUAGES } from "@/lib/i18n"
import { allTranslations } from "@/lib/i18n/review"

export const dynamic = "force-dynamic"
export const metadata = { title: "Translations | ANDA", robots: { index: false } }

export default async function TranslationsPage() {
  if (!(await getAdminEmail())) notFound()
  const rows = allTranslations()
  const missing = (lang: "fr" | "pt") => rows.filter((r) => !r[lang]).length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Translations for review</h1>
          <p className="text-muted-foreground max-w-3xl">
            {rows.length} strings. French: {missing("fr")} missing; Portuguese: {missing("pt")} missing. Reviewed:{" "}
            {REVIEWED_LANGUAGES.length ? REVIEWED_LANGUAGES.join(", ") : "none yet"}. Send the CSV to a native
            speaker; they fill in the “corrected” columns and send it back (see docs/TRANSLATIONS.md).
          </p>
          <p>
            <a href="/admin/translations/csv" className="text-primary underline">
              Download CSV for translators
            </a>{" "}
            · <Link href="/admin" className="text-primary underline">Admin dashboard</Link>
          </p>
        </header>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-2 font-medium">Key</th>
                <th className="p-2 font-medium">English</th>
                <th className="p-2 font-medium">Français</th>
                <th className="p-2 font-medium">Português</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-t align-top">
                  <td className="p-2 font-mono text-xs">{r.key}</td>
                  <td className="p-2" lang="en">{r.en}</td>
                  <td className="p-2" lang="fr">{r.fr || <em className="text-destructive">missing</em>}</td>
                  <td className="p-2" lang="pt">{r.pt || <em className="text-destructive">missing</em>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
