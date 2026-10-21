// Home-page pathways (brief §45). Every step links to a feature that exists.
import { fr as pathwaysFr, pt as pathwaysPt } from "@/lib/i18n/messages/pathways"

export interface Pathway {
  slug: "individual" | "family" | "professional"
  title: string
  intro: string
  steps: { label: string; href: string; detail: string }[]
}

export const PATHWAYS: Pathway[] = [
  {
    slug: "individual",
    title: "I'm an Individual",
    intro: "For neurodivergent people, or anyone wondering whether they might be, who want to understand themselves and find practical support.",
    steps: [
      { label: "Take the quick self-check", href: "/self-test", detail: "Five reflective questions. Not a diagnosis." },
      { label: "Create your support profile", href: "/people/new", detail: "Your strengths, what's hard, and what helps, in your own words." },
      { label: "Get companion prompts", href: "/companion", detail: "Check-in prompts and next steps from your own notes. No AI unless you choose it." },
      { label: "Find support near you", href: "/directory", detail: "Organisations and services across Africa." },
    ],
  },
  {
    slug: "family",
    title: "I'm a Parent or Caregiver",
    intro: "For families supporting a child or relative, turning what you know about them into goals and steady progress.",
    steps: [
      { label: "Create a support profile", href: "/people/new", detail: "Start with what you see at home. No assessment needed." },
      { label: "Build a plan with goals", href: "/iep/generate", detail: "Step by step: where they are now, what you're aiming for, how you'll measure it." },
      { label: "Track progress", href: "/dashboard", detail: "Quick check-ins and a timeline of what's changing." },
      { label: "Bring in teachers and therapists", href: "/dashboard", detail: "Invite a support team to follow and contribute (Pro)." },
    ],
  },
  {
    slug: "professional",
    title: "I'm a Professional or Educator",
    intro: "For teachers, therapists, schools and organisations supporting several learners.",
    steps: [
      { label: "Screen your learners", href: "/screening", detail: "A quick, non-diagnostic check-in for each learner." },
      { label: "Plan and track goals", href: "/iep/generate", detail: "Baseline, target and measurement for every goal." },
      { label: "See everyone at a glance", href: "/team-dashboard", detail: "All your learners and staff in one place (Pro)." },
      { label: "Enroll a class from a CSV", href: "/learners/import", detail: "Bulk enrollment and organisation-wide export (Institutional)." },
      { label: "Keep learning", href: "/learning", detail: "Courses and training from real providers." },
    ],
  },
]

export function findPathway(slug: string): Pathway | undefined {
  return PATHWAYS.find((p) => p.slug === slug)
}

/** PATHWAYS in the site language; anything not yet translated stays in English. */
export function localizePathways(lang: string): Pathway[] {
  const dict = lang === "fr" ? pathwaysFr : lang === "pt" ? pathwaysPt : null
  if (!dict) return PATHWAYS
  const tr = (key: string, fallback: string) => dict[key] ?? fallback
  return PATHWAYS.map((p) => ({
    ...p,
    title: tr(`${p.slug}.title`, p.title),
    intro: tr(`${p.slug}.intro`, p.intro),
    steps: p.steps.map((s, i) => ({
      ...s,
      label: tr(`${p.slug}.${i}.label`, s.label),
      detail: tr(`${p.slug}.${i}.detail`, s.detail),
    })),
  }))
}
