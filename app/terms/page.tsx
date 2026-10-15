import Link from "next/link"
import { LegalPage } from "@/components/legal-page"
import { LEGAL_CONTACT_EMAIL, LEGAL_OWNER } from "@/lib/legal"

export const metadata = {
  title: "Terms of use | ANDA",
  description: "The rules for using ANDA: accounts, plans and payments, community content, AI features and limits.",
}

const email = <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro={`These terms apply when you use ANDA (the African Neurodiversity Alliance), run by ${LEGAL_OWNER}. By creating an account or using the site, you agree to them. Please also read our privacy policy.`}
      sections={[
        {
          id: "not-medical",
          heading: "ANDA is not medical advice",
          body: (
            <p>
              ANDA helps you plan and organise support. It doesn&apos;t diagnose, treat or replace qualified
              professionals. Self-checks and screenings are not a diagnosis. Guides such as{" "}
              <Link href="/learning/what-works">What works?</Link> are general information. Talk to a doctor, therapist
              or educational professional about decisions for a particular person. In an emergency, contact local
              emergency services.
            </p>
          ),
        },
        {
          id: "accounts",
          heading: "Your account",
          body: (
            <ul>
              <li>Give accurate information and keep your password safe. You&apos;re responsible for activity on your account.</li>
              <li>
                Only create a profile for someone you support with their permission, or, for a child, as their parent or
                guardian or with the guardian&apos;s permission.
              </li>
              <li>When you invite people to a support team, you decide what they can see and do, and you can remove them.</li>
            </ul>
          ),
        },
        {
          id: "plans",
          heading: "Plans and payments",
          body: (
            <ul>
              <li>
                Some features need a paid plan. Prices and what each plan includes are shown before you pay. Payments
                are processed by Flutterwave or Paystack.
              </li>
              <li>ANDA and NeuRafiki are billed separately. A plan for one doesn&apos;t include the other.</li>
              <li>If a plan ends, paid features stop, but your existing information stays in your account.</li>
              <li>For billing questions or refund requests, email {email}.</li>
            </ul>
          ),
        },
        {
          id: "content",
          heading: "What you post",
          body: (
            <>
              <p>
                You keep ownership of what you write and upload. You give us permission to store and display it as
                needed to run ANDA, for example showing a community post or a resource you suggested.
              </p>
              <p>Please don&apos;t post anything that:</p>
              <ul>
                <li>shares someone else&apos;s private or health information without permission;</li>
                <li>is abusive, discriminatory or harassing, or mocks neurodivergent people;</li>
                <li>promotes dangerous &quot;cures&quot; or treatments (see What works? for examples);</li>
                <li>is spam, advertising, or breaks the law.</li>
              </ul>
              <p>We may remove content or close accounts that break these rules.</p>
            </>
          ),
        },
        {
          id: "ai",
          heading: "AI features",
          body: (
            <p>
              AI chat and AI-drafted plans can be wrong. Check anything important with a professional. AI drafts only
              become part of a plan when a person approves them. Daily limits apply, and AI features may pause when a
              daily limit is reached.
            </p>
          ),
        },
        {
          id: "links",
          heading: "Other websites and listings",
          body: (
            <p>
              ANDA links to news, research, books, apps and support organisations run by others. Some are found
              automatically and are marked that way. We don&apos;t control or endorse them, so check that a service or
              product suits you before using or paying for it.
            </p>
          ),
        },
        {
          id: "liability",
          heading: "Availability and responsibility",
          body: (
            <p>
              We work to keep ANDA available and accurate, but we can&apos;t promise it will always be uninterrupted or
              error-free. To the extent the law allows, {LEGAL_OWNER} isn&apos;t responsible for losses that come from
              relying on general information on the site instead of professional advice. Nothing in these terms limits
              rights you have under the law that can&apos;t be limited.
            </p>
          ),
        },
        {
          id: "ip",
          heading: "Copyright",
          body: (
            <p>
              The ANDA name, design and site content are &copy; {LEGAL_OWNER}, except content owned by users or by the
              third parties we link to. You may share links to ANDA pages freely.
            </p>
          ),
        },
        {
          id: "changes",
          heading: "Changes and contact",
          body: (
            <p>
              We may update these terms. If a change matters, we&apos;ll update the date above and tell you in the app
              or by email. Questions: {email}.
            </p>
          ),
        },
      ]}
    />
  )
}
