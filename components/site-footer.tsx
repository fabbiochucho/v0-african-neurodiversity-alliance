import Link from "next/link"
import { AndaLogo } from "@/components/anda-logo"
import { KenteStrip } from "@/components/afro/kente-strip"
import { getSiblingAppUrl } from "@/lib/federation/config"
import { BECOMECHANGE_URL, COPYRIGHT_HOLDER, LEGAL_BRAND, LEGAL_CONTACT_EMAIL } from "@/lib/legal"

const COLUMNS = [
  {
    title: "Get support",
    links: [
      { href: "/self-test", label: "Self-check" },
      { href: "/iep", label: "Support plans" },
      { href: "/directory", label: "Find support" },
      { href: "/apps-tools", label: "Apps & tools" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/learning", label: "Learning" },
      { href: "/learning/what-works", label: "What works?" },
      { href: "/news", label: "News & research" },
      { href: "/research", label: "Research" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/community", label: "Forum" },
      { href: "/advocacy", label: "Advocacy" },
      { href: "/about", label: "About ANDA" },
      { href: "/donate", label: "Donate" },
    ],
  },
]

// Site-wide footer (rendered once in app/layout.tsx). Hidden when printing
// so printed reports stay clean.
export function SiteFooter() {
  const neurafikiUrl = getSiblingAppUrl()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-background print:hidden">
      <KenteStrip height={10} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4 max-w-sm sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block" aria-label="ANDA home">
              <AndaLogo />
            </Link>
            <p className="text-muted-foreground text-pretty">
              Empowering neurodivergent individuals across Africa through awareness, education, and inclusive support
              systems.
            </p>
            <p className="text-sm text-muted-foreground">
              Questions or data requests:{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="underline hover:text-foreground break-all">
                {LEGAL_CONTACT_EMAIL}
              </a>
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-sans text-sm font-semibold mb-3">{col.title}</h2>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-muted-foreground hover:text-foreground hover:underline">
                      {l.label}
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
            ANDA and{" "}
            {neurafikiUrl ? (
              <a href={neurafikiUrl} className="underline hover:text-foreground">
                NeuRafiki
              </a>
            ) : (
              "NeuRafiki"
            )}{" "}
            are products of{" "}
            <a href={BECOMECHANGE_URL} className="underline hover:text-foreground">
              {LEGAL_BRAND}
            </a>
            .
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 text-sm md:justify-end">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground hover:underline">
              Privacy policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground hover:underline">
              Terms of use
            </Link>
            <Link href="/guidelines" className="text-muted-foreground hover:text-foreground hover:underline">
              Community guidelines
            </Link>
            <Link href="/accessibility" className="text-muted-foreground hover:text-foreground hover:underline">
              Accessibility statement
            </Link>
            <Link href="/settings/accessibility" className="text-muted-foreground hover:text-foreground hover:underline">
              Accessibility settings
            </Link>
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-muted-foreground hover:text-foreground hover:underline">
              Contact
            </a>
          </nav>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          &copy; {year} {COPYRIGHT_HOLDER}. All rights reserved. ANDA: African Neurodiversity Alliance.
        </p>
      </div>
    </footer>
  )
}
