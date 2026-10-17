import Link from "next/link"
import { LegalPage } from "@/components/legal-page"
import { LEGAL_CONTACT_EMAIL, LEGAL_OWNER } from "@/lib/legal"

export const metadata = {
  title: "Accessibility statement | ANDA",
  description: "The accessibility standard ANDA works to, what we know still needs fixing, and how to tell us about a problem.",
}

const email = <a href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=Accessibility`}>{LEGAL_CONTACT_EMAIL}</a>

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility statement"
      intro={`ANDA is built for neurodivergent people and the families, teachers and professionals around them, so it has to work for everyone. ${LEGAL_OWNER} runs ANDA and is responsible for this statement.`}
      sections={[
        {
          id: "standard",
          heading: "The standard we work to",
          body: (
            <p>
              We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. We check pages with
              automated tools and by hand, using a keyboard alone and a screen reader.
            </p>
          ),
        },
        {
          id: "features",
          heading: "What we've built in",
          body: (
            <ul>
              <li>Every task can be done with a keyboard, with a visible focus outline.</li>
              <li>Plain language, short sections and no time limits.</li>
              <li>Colours are chosen to meet WCAG contrast levels, and pages respect your reduced-motion setting.</li>
              <li>
                Calm colours, larger text, reduced motion and other display options on the{" "}
                <Link href="/settings/accessibility">accessibility settings</Link> page.
              </li>
            </ul>
          ),
        },
        {
          id: "gaps",
          heading: "What we know isn't right yet",
          body: (
            <ul>
              <li>We haven&apos;t finished testing every page with a screen reader.</li>
              <li>Some content comes from other websites (news, research, books and apps), and we can&apos;t fix pages we link to.</li>
            </ul>
          ),
        },
        {
          id: "report",
          heading: "Tell us about a problem",
          body: (
            <p>
              If something is hard to use, or you need information in another format, email {email}. Tell us the page and
              what happened. We&apos;ll reply within 10 working days.
            </p>
          ),
        },
      ]}
    />
  )
}
