import Link from "next/link"
import { AndaLogo } from "@/components/anda-logo"
import { KenteStrip } from "@/components/afro/kente-strip"
import { getSiblingAppUrl } from "@/lib/federation/config"
import { BECOMECHANGE_URL, COPYRIGHT_HOLDER, LEGAL_BRAND, LEGAL_CONTACT_EMAIL } from "@/lib/legal"
import { t, type MessageKey, type SiteLanguage } from "@/lib/i18n"

const COLUMNS: { title: MessageKey; links: { href: string; label: MessageKey }[] }[] = [
  {
    title: "footer.getSupport",
    links: [
      { href: "/self-test", label: "footer.selfCheck" },
      { href: "/iep", label: "footer.supportPlans" },
      { href: "/directory", label: "footer.findSupport" },
      { href: "/apps-tools", label: "footer.appsTools" },
    ],
  },
  {
    title: "footer.learn",
    links: [
      { href: "/learning", label: "footer.learning" },
      { href: "/learning/what-works", label: "footer.whatWorks" },
      { href: "/news", label: "footer.newsResearch" },
      { href: "/research", label: "footer.research" },
    ],
  },
  {
    title: "footer.community",
    links: [
      { href: "/community", label: "footer.forum" },
      { href: "/advocacy", label: "footer.advocacy" },
      { href: "/about", label: "footer.about" },
      { href: "/donate", label: "footer.donate" },
    ],
  },
]

// Site-wide footer (rendered once in app/layout.tsx). Hidden when printing
// so printed reports stay clean.
export function SiteFooter({ lang = "en" }: { lang?: SiteLanguage }) {
  const tr = (key: MessageKey) => t(key, {}, lang)
  const neurafikiUrl = getSiblingAppUrl()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-background print:hidden">
      <KenteStrip height={10} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4 max-w-sm sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <AndaLogo />
            </Link>
            <p className="text-muted-foreground text-pretty">
              {tr("footer.tagline")}
            </p>
            <p className="text-sm text-muted-foreground">
              {tr("footer.contact")}{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="underline hover:text-foreground break-all">
                {LEGAL_CONTACT_EMAIL}
              </a>
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={tr(col.title)}>
              <h2 className="font-sans text-sm font-semibold mb-3">{tr(col.title)}</h2>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-muted-foreground hover:text-foreground hover:underline">
                      {tr(l.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Family of sites */}
        <div className="mt-12 border-t pt-6 grid gap-4 md:grid-cols-2 md:items-center">
          <p className="text-sm text-muted-foreground text-pretty">
            {tr("footer.familyStart")}{" "}
            {neurafikiUrl ? (
              <a href={neurafikiUrl} className="underline hover:text-foreground">
                NeuRafiki
              </a>
            ) : (
              "NeuRafiki"
            )}{" "}
            {tr("footer.familyMiddle")}{" "}
            <a href={BECOMECHANGE_URL} className="underline hover:text-foreground">
              {LEGAL_BRAND}
            </a>
            .
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 text-sm md:justify-end">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground hover:underline">
              {tr("footer.privacy")}
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground hover:underline">
              {tr("footer.terms")}
            </Link>
            <Link href="/guidelines" className="text-muted-foreground hover:text-foreground hover:underline">
              {tr("footer.guidelines")}
            </Link>
            <Link href="/accessibility" className="text-muted-foreground hover:text-foreground hover:underline">
              {tr("footer.a11yStatement")}
            </Link>
            <Link href="/settings/accessibility" className="text-muted-foreground hover:text-foreground hover:underline">
              {tr("footer.a11ySettings")}
            </Link>
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-muted-foreground hover:text-foreground hover:underline">
              {tr("footer.contactLink")}
            </a>
          </nav>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          &copy; {year} {COPYRIGHT_HOLDER}. {tr("footer.rights")}
        </p>
      </div>
    </footer>
  )
}
