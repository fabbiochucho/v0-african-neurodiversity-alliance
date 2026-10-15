import Link from "next/link"
import { LegalPage } from "@/components/legal-page"
import { LEGAL_CONTACT_EMAIL, LEGAL_OWNER } from "@/lib/legal"
import { DPO_CLAUSE } from "@/lib/dpo"

export const metadata = {
  title: "Privacy policy | ANDA",
  description: "What ANDA collects, why, who processes it, and how to access, export or delete your data.",
}

const email = <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro={`ANDA (the African Neurodiversity Alliance) is run by ${LEGAL_OWNER}. This policy explains, in plain language, what information we collect, why, who helps us process it, and the choices you have. It is designed to support applicable data-protection requirements; it doesn't claim certification under any particular law.`}
      sections={[
        {
          id: "collect",
          heading: "What we collect",
          body: (
            <>
              <ul>
                <li>
                  <strong>Your account:</strong> name, email address and sign-in details.
                </li>
                <li>
                  <strong>People you support:</strong> the profiles you create, often for a child or relative: their name,
                  strengths, what they find hard, what helps, communication and sensory notes, school context,
                  country, language and education setting.
                </li>
                <li>
                  <strong>Plans and progress:</strong> support plans, goals, strategies, check-ins, progress notes and
                  reports.
                </li>
                <li>
                  <strong>Documents you upload:</strong> existing assessments or reports. These are kept in private
                  storage that only you, and people you give access to, can open.
                </li>
                <li>
                  <strong>Support team access:</strong> who you invited, what each person may do, and when.
                </li>
                <li>
                  <strong>Settings:</strong> your display preferences (for example calm colours or larger text).
                </li>
                <li>
                  <strong>Payments:</strong> your plan, payment status and reference numbers. Card and mobile-money
                  details are handled by our payment providers and never reach us.
                </li>
                <li>
                  <strong>Things you share publicly:</strong> community posts, resource suggestions and ratings.
                </li>
                <li>
                  <strong>Activity records:</strong> a log of who viewed, changed or exported a person&apos;s records,
                  so you can see who has had access.
                </li>
              </ul>
              <p>
                We only collect what we need to provide the service. Please don&apos;t add more about a person than
                their support requires.
              </p>
            </>
          ),
        },
        {
          id: "children",
          heading: "Children and the people you support",
          body: (
            <p>
              Much of what is stored on ANDA is about children and is sensitive. Only a parent or legal guardian, or
              someone with their permission, should create a child&apos;s profile. The person who creates a profile
              controls it: they decide who joins its support team and what each member may do. For under-18s, only the
              parent or guardian can let others approve plans, manage the plan, invite people or export records.
            </p>
          ),
        },
        {
          id: "use",
          heading: "How we use it",
          body: (
            <ul>
              <li>To run your account, plans, progress tracking, reports and support team.</li>
              <li>To take payments and manage your plan.</li>
              <li>To send the emails you ask for: reports, team invitations and, if you subscribe, the weekly digest.</li>
              <li>To keep the service secure and fix problems.</li>
            </ul>
          ),
        },
        {
          id: "ai",
          heading: "AI features",
          body: (
            <>
              <p>
                AI chat and AI-drafted plans are optional. Without your separate consent for a specific person, no
                information about them is sent to the AI.
              </p>
              <p>
                With consent, we send only their first name, their current goals, a short summary of recent check-ins
                and, when you ask for an AI-drafted plan, the support profile you wrote. Never a surname, date of birth,
                uploaded documents or reports. The AI runs on Cloudflare Workers AI, using an open AI model. We don&apos;t
                save chat conversations; we only count messages to apply daily limits. AI drafts stay marked as drafts
                until a person approves them. You can withdraw consent at any time on your{" "}
                <Link href="/account/privacy">privacy page</Link>, and it takes effect from the next message.
              </p>
            </>
          ),
        },
        {
          id: "neurafiki",
          heading: "Linking with NeuRafiki",
          body: (
            <p>
              NeuRafiki is our separate screening product, with its own account and billing. If you choose to link the
              two, NeuRafiki can send ANDA a structured summary of a screening or check-in (for example the areas
              explored and support priorities), only with your consent. Raw screening answers and private notes are
              never shared. You can unlink at any time in your account.
            </p>
          ),
        },
        {
          id: "processors",
          heading: "Who helps us process data",
          body: (
            <>
              <p>We use these service providers, each only for the job described:</p>
              <ul>
                <li>
                  <strong>Supabase:</strong> database, sign-in and private file storage.
                </li>
                <li>
                  <strong>Vercel:</strong> hosting, plus Vercel Analytics for anonymous, aggregated page-visit counts.
                </li>
                <li>
                  <strong>Flutterwave and Paystack:</strong> payments.
                </li>
                <li>
                  <strong>Resend:</strong> sending emails.
                </li>
                <li>
                  <strong>Cloudflare:</strong> AI features, only as described above.
                </li>
              </ul>
              <p>
                We don&apos;t sell personal information, and we don&apos;t use it for advertising. News, research,
                books and apps on ANDA link to other websites, which have their own privacy policies.
              </p>
            </>
          ),
        },
        {
          id: "security",
          heading: "Keeping it safe",
          body: (
            <p>
              Data is encrypted in transit. Database rules limit every account to its own records and to records
              shared with it through a support team. Uploaded documents sit in private storage. No system is
              perfectly secure, so please use a strong password and tell us straight away if you think your account
              has been misused.
            </p>
          ),
        },
        {
          id: "rights",
          heading: "Your choices and rights",
          body: (
            <>
              <ul>
                <li>See and correct your information at any time in your account.</li>
                <li>
                  Withdraw any consent (AI, support team access, NeuRafiki link) on your{" "}
                  <Link href="/account/privacy">privacy page</Link>.
                </li>
                <li>
                  Delete your account and its data yourself on the same page. Payment records are kept for financial
                  and legal reasons, but with your name removed.
                </li>
                <li>Unsubscribe from the weekly digest using the link in any digest email.</li>
                <li>Ask us for a copy of your data, or anything else about this policy, by emailing {email}.</li>
              </ul>
            </>
          ),
        },
        {
          id: "retention",
          heading: "How long we keep it",
          body: (
            <p>
              We keep your information while your account is open. When you delete your account, we delete your
              profiles, plans, progress, reports, uploaded documents, consents and team memberships. Payment records
              are kept, anonymised, for as long as the law requires.
            </p>
          ),
        },
        {
          id: "dpo",
          heading: DPO_CLAUSE.heading,
          body: (
            <>
              <p>{DPO_CLAUSE.intro}</p>
              <p>{DPO_CLAUSE.lead}</p>
              <ul>
                {DPO_CLAUSE.details.map(([label, value]) => (
                  <li key={label}>
                    {label}:{" "}
                    {label === "Official Contact Email" ? (
                      <a href={`mailto:${value}`}>{value}</a>
                    ) : label === "Contact Phone Number" ? (
                      <a href={`tel:${value}`}>{value}</a>
                    ) : (
                      value
                    )}
                  </li>
                ))}
              </ul>
              <p>{DPO_CLAUSE.closing}</p>
            </>
          ),
        },
        {
          id: "changes",
          heading: "Changes and contact",
          body: (
            <p>
              If we change this policy in a way that matters, we&apos;ll update the date above and tell you in the
              app or by email. Questions or requests: {email}. ANDA is run by {LEGAL_OWNER}.
            </p>
          ),
        },
      ]}
    />
  )
}
