import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { ThreadMark } from "@/components/afro/thread-mark"
import { LEGAL_CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/legal"

export const metadata = {
  title: "Community guidelines | ANDA",
  description: "How we treat each other on ANDA: respectful, accurate and private support for neurodivergent people across Africa.",
}

const PRINCIPLES = [
  { label: "Dignity", desc: "Neurodivergence is a difference, not a defect", thread: "var(--thread-teal)" },
  { label: "Accuracy", desc: "Share what's true, and say where it came from", thread: "var(--thread-gold)" },
  { label: "Privacy", desc: "Protect people, especially children", thread: "var(--thread-indigo)" },
  { label: "Inclusion", desc: "Every family, language and context belongs", thread: "var(--thread-terracotta)" },
]

const SECTIONS = [
  {
    title: "Respect and neurodiversity-affirming language",
    description: "Treat everyone with respect, and talk about neurodivergence with dignity.",
    thread: "var(--thread-teal)",
    rules: [
      "Use respectful language about autism, ADHD, dyslexia and every other difference. Many people prefer identity-first language (\"autistic person\"), others person-first. Follow the person's own preference.",
      "Don't describe neurodivergent people as broken, cursed, a burden, or something to be cured.",
      "Respect different cultures, faiths, family structures and beliefs across Africa, while never excusing harm to a child or adult.",
      "No harassment, bullying, threats, discrimination or personal attacks, on the site or about people from it.",
      "Disagree kindly and stay focused on the idea, not the person.",
    ],
  },
  {
    title: "Accurate and safe information",
    description: "Families make real decisions from what they read here.",
    thread: "var(--thread-gold)",
    rules: [
      "Share personal experience as your own experience, not as advice for everyone.",
      "When you share research or a claim, link to where it came from.",
      "Never promote dangerous \"cures\" such as MMS or chlorine dioxide (bleach), chelation, or hyperbaric oxygen for autism. They can cause serious harm. See What works? for the evidence.",
      "Don't diagnose other people or tell anyone to stop prescribed treatment. Suggest they speak to a qualified professional.",
      "If you notice a mistake in anything on ANDA, including our own guides, tell us so we can correct it.",
    ],
  },
  {
    title: "Privacy and protecting children",
    description: "Much of what's shared on ANDA is about children and is sensitive.",
    thread: "var(--thread-indigo)",
    rules: [
      "Don't post a child's full name, school, photo, location or diagnosis in public spaces such as the community forum.",
      "Only share someone else's story with their permission, or, for a child, their parent or guardian's permission.",
      "Keep private information private: use support plans and team access, not public posts, for details about a person.",
      "Never try to identify anonymous members or donors.",
      "If you see a child or adult at risk of harm, contact local emergency services first, then tell us.",
    ],
  },
  {
    title: "Support teams",
    description: "For parents, teachers, therapists and others working on someone's plan together.",
    thread: "var(--thread-green)",
    rules: [
      "Only use your access for the person you're supporting, and only for what you've been given permission to do.",
      "Write observations and progress notes that are factual, kind and useful to the rest of the team.",
      "Don't copy, screenshot or share a person's records outside the team.",
      "Respect the parent or guardian's decisions about who joins a child's team.",
      "If your role changes or ends, ask the plan owner to remove your access.",
    ],
  },
  {
    title: "Directory, resources and reviews",
    description: "Standards for suggesting organisations, apps, books and courses, and for ratings.",
    thread: "var(--thread-terracotta)",
    rules: [
      "Only suggest real organisations, services and products, with a working website or contact.",
      "Say honestly if you work for, own or are paid by something you suggest or review.",
      "Base ratings and reviews on your own experience. No fake reviews, and no rating your own service.",
      "Don't list services that promise to cure neurodivergence or use harmful practices.",
      "Tell us if a listing is out of date, closed or misleading.",
    ],
  },
  {
    title: "Using AI features responsibly",
    description: "AI chat and AI-drafted plans are helpers, not experts.",
    thread: "var(--thread-gold)",
    rules: [
      "Treat AI answers as a starting point, and check anything important with a professional.",
      "Review and edit AI-drafted goals before approving them. A person, not the AI, decides what goes in a plan.",
      "Only share a person's information with the AI when you have the right to, and they or their guardian would agree.",
      "Don't use AI features to create misleading content or anything these guidelines don't allow.",
    ],
  },
  {
    title: "Photos, stories and other content",
    description: "For anything you upload or post.",
    thread: "var(--thread-teal)",
    rules: [
      "Only upload content you own or have permission to use.",
      "Get consent before sharing a photo or video of anyone, and a parent or guardian's consent for a child.",
      "Avoid content that exploits distress, meltdowns or vulnerability for attention.",
      "No spam, advertising or self-promotion unrelated to supporting neurodivergent people.",
    ],
  },
  {
    title: "Reporting problems",
    description: "How to raise a concern, and what happens next.",
    thread: "var(--thread-indigo)",
    rules: [
      `Email ${LEGAL_CONTACT_EMAIL} with a link to the content and what's wrong. Admins can also hide news and research items directly.`,
      "For urgent safety concerns, contact local emergency services or a crisis line (findahelpline.com) first.",
      "Don't argue in public threads. Report it and let us handle it.",
      "Deliberately false reports are themselves a breach of these guidelines.",
    ],
  },
]

const ROLES = [
  {
    role: "Neurodivergent people",
    rules: [
      "Your experience is valid. Share as much or as little as you're comfortable with.",
      "Use your support profile to describe what helps you, in your own words.",
      "You control who sees your plan and progress.",
    ],
  },
  {
    role: "Parents and caregivers",
    rules: [
      "You decide who joins your child's support team and what they can do.",
      "Involve your child in their own plan as much as they're able.",
      "Protect your child's privacy in public spaces.",
    ],
  },
  {
    role: "Teachers and schools",
    rules: [
      "Record classroom observations factually and kindly.",
      "Use plans to support the learner, not to label or exclude them.",
      "Follow your school's own safeguarding and data rules as well as these guidelines.",
    ],
  },
  {
    role: "Therapists and clinicians",
    rules: [
      "Stay within your professional scope and your country's professional rules.",
      "Make clear when something is professional input rather than general information.",
      "Don't use ANDA to promote your private services in community spaces.",
    ],
  },
  {
    role: "Organisations in the directory",
    rules: [
      "Keep your listing accurate, including contact details and the services you offer.",
      "Describe what you do honestly, without promising cures.",
      "Respond to families respectfully, whether or not they become clients.",
    ],
  },
]

const LEVELS = [
  {
    level: "Minor",
    text: "A reminder, and the content edited or removed. For example: off-topic posts, a missing source, an out-of-date listing.",
  },
  {
    level: "Serious",
    text: "Content removed and account features restricted. For example: harassment, fake reviews, sharing a child's details publicly.",
  },
  {
    level: "Severe",
    text: "Account closed, and serious matters reported to the authorities. For example: exploiting or endangering a child, promoting dangerous cures, fraud.",
  },
]

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold text-balance">Community guidelines</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated {LEGAL_UPDATED}</p>
          <p className="mt-6 text-lg text-pretty">
            How we look after each other on ANDA. These guidelines apply to everyone: individuals, families, educators,
            professionals and organisations, on every plan. They sit alongside our{" "}
            <Link href="/terms" className="text-primary underline">
              terms of use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary underline">
              privacy policy
            </Link>
            .
          </p>

          <section aria-labelledby="principles-h" className="mt-10">
            <h2 id="principles-h" className="text-2xl font-semibold">
              Our principles
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {PRINCIPLES.map((p) => (
                <li key={p.label} className="flex gap-3 rounded-2xl border bg-card p-4">
                  <ThreadMark color={p.thread} className="mt-1" />
                  <span>
                    <span className="block font-semibold">{p.label}</span>
                    <span className="block text-sm text-muted-foreground">{p.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-12 space-y-10">
            {SECTIONS.map((s, i) => (
              <section key={s.title} aria-labelledby={`g-${i}`}>
                <h2 id={`g-${i}`} className="flex items-center gap-3 text-2xl font-semibold">
                  <ThreadMark color={s.thread} />
                  {s.title}
                </h2>
                <p className="mt-1 text-muted-foreground">{s.description}</p>
                <ul className="mt-4 space-y-2.5 list-disc pl-5 marker:text-muted-foreground">
                  {s.rules.map((r) => (
                    <li key={r} className="text-pretty break-words">
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section aria-labelledby="roles-h" className="mt-14">
            <h2 id="roles-h" className="text-2xl font-semibold">
              Guidance for your role
            </h2>
            <div className="mt-4 divide-y rounded-2xl border bg-card">
              {ROLES.map((r) => (
                <details key={r.role} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none font-semibold flex items-center justify-between gap-3">
                    {r.role}
                    <span aria-hidden="true" className="text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <ul className="mt-3 space-y-2 list-disc pl-5 text-pretty">
                    {r.rules.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>

          <section aria-labelledby="breaches-h" className="mt-14 rounded-2xl border-2 border-[var(--thread-gold)] p-6">
            <h2 id="breaches-h" className="text-2xl font-semibold">
              If guidelines are broken
            </h2>
            <ul className="mt-4 space-y-4">
              {LEVELS.map((l) => (
                <li key={l.level}>
                  <p className="font-semibold">{l.level}</p>
                  <p className="text-muted-foreground text-pretty">{l.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-pretty">
              If you think we got a decision wrong, email{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-primary underline break-all">
                {LEGAL_CONTACT_EMAIL}
              </a>{" "}
              and someone who wasn&apos;t involved will look at it again.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
