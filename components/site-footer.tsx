import Link from "next/link"
import { AndaLogo } from "@/components/anda-logo"
import { KenteStrip } from "@/components/afro/kente-strip"

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

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <KenteStrip height={10} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4 max-w-sm">
            <Link href="/" className="inline-block" aria-label="ANDA home">
              <AndaLogo />
            </Link>
            <p className="text-muted-foreground text-pretty">
              Empowering neurodivergent individuals across Africa through awareness, education, and inclusive support
              systems.
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
        <p className="mt-12 border-t pt-6 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} African Neurodiversity Alliance, part of BecomeChange Institute.
        </p>
      </div>
    </footer>
  )
}
