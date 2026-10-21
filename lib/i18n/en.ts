// English strings. Add other languages as sibling files with the same keys.
// Page-by-page strings live in ./messages/<area>.ts with all three languages side by side.
import * as auth from "./messages/auth"
import * as common from "./messages/common"
import * as about from "./messages/about"
import * as donate from "./messages/donate"
export const en = {
  "plan.disclaimer":
    "This {plan} is a planning and tracking tool. It isn't a legal document and doesn't replace your school's or education authority's official plan or process.",
  "plan.fullPlan": "Full {plan}",
  "plan.title": "{name}'s {plan}",
  "plan.quarterlyReview": "Quarterly {plan} review",
  "settings.localisation.title": "Country, language and education context",
  "settings.localisation.help": "Used only to adjust words like the name of the plan. ANDA works the same everywhere.",
  "state.saveFailed": "Something didn't save. Your information is still here. Try again.",
  "state.loadFailed": "We couldn't load this just now. Your information is safe. Try again.",
  "dashboard.empty.title": "Your journey starts here.",

  // Site language
  "i18n.language": "Language",
  "i18n.draftNotice": "This page was translated automatically and may contain mistakes. Some parts are still in English.",

  // Navigation
  "nav.about": "About",
  "nav.resources": "Resources",
  "nav.selfTest": "Self-Test Tool",
  "nav.iep": "IEP Generator",
  "nav.findSupport": "Find Support",
  "nav.appsTools": "Apps & Tools",
  "nav.learning": "Learning",
  "nav.community": "Community",
  "nav.advocacy": "Advocacy",
  "nav.research": "Research",
  "nav.news": "News",
  "nav.signIn": "Sign In",
  "nav.donate": "Donate",
  "nav.displaySettings": "Display and sensory settings",
  "nav.displaySettingsShort": "Display settings",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",

  // Footer
  "footer.tagline":
    "Empowering neurodivergent individuals across Africa through awareness, education, and inclusive support systems.",
  "footer.contact": "Questions or data requests:",
  "footer.getSupport": "Get support",
  "footer.learn": "Learn",
  "footer.community": "Community",
  "footer.selfCheck": "Self-check",
  "footer.supportPlans": "Support plans",
  "footer.findSupport": "Find support",
  "footer.appsTools": "Apps & tools",
  "footer.learning": "Learning",
  "footer.whatWorks": "What works?",
  "footer.newsResearch": "News & research",
  "footer.research": "Research",
  "footer.forum": "Forum",
  "footer.advocacy": "Advocacy",
  "footer.about": "About ANDA",
  "footer.donate": "Donate",
  "footer.familyStart": "ANDA and",
  "footer.familyMiddle": "are products of",
  "footer.privacy": "Privacy policy",
  "footer.terms": "Terms of use",
  "footer.guidelines": "Community guidelines",
  "footer.a11yStatement": "Accessibility statement",
  "footer.a11ySettings": "Accessibility settings",
  "footer.contactLink": "Contact",
  "footer.rights": "All rights reserved. ANDA: African Neurodiversity Alliance.",

  // Home page
  "home.heroTitle": "Understand every mind.",
  "home.heroTitleAccent": "Support every journey.",
  "home.heroText":
    "ANDA helps individuals, families, educators and professionals turn neurodiversity assessment into practical support, meaningful goals and measurable progress.",
  "home.start": "Start with NeuRafiki",
  "home.explore": "Explore ANDA",
  "home.loopHint": "Tap a step on the loop to see what happens there.",
  "home.statsLabel": "What you'll find",
  "home.statsIntro": "Already gathered for you:",
  "home.statsOrganisations": "{n} support organisations",
  "home.statsPapers": "{n} open-access research papers",
  "home.statsBooks": "{n} books and story books",
  "home.statsApps": "{n} apps",
  "home.statsAnd": "and",
  "home.pathwaysTitle": "Where would you like to start?",
  "home.ecosystemTitle": "Everything in one place",
  "home.ecosystemText": "From a first check-in to a plan a teacher can follow, and the people and evidence to back it up.",
  "home.whyTitle": "Made for how support really works in Africa",
  "home.whyText": "Often there's no specialist nearby, no diagnosis yet, and a slow connection. ANDA is built for that.",
  "home.joinTitle": "Join the movement for neurodiversity in Africa",
  "home.joinText":
    "Whether you're neurodivergent, a caregiver, educator, or advocate, there's a place for you in our community.",
  "home.joinStart": "Start your journey",
  "home.joinDonate": "Support our mission",

  "home.eco.selfCheck": "Self-check",
  "home.eco.selfCheckText": "A quick, free check-in on neurodivergent traits, linked to NeuRafiki for the full screening.",
  "home.eco.findSupport": "Find support",
  "home.eco.findSupportText": "Schools, therapists, support groups and helplines across Africa, filterable by condition.",
  "home.eco.plans": "Support plans",
  "home.eco.plansText": "Step-by-step plans with goals, strategies and reviews, shared with the people who help.",
  "home.eco.learning": "Learning",
  "home.eco.learningText": "Courses, story books, cartoons and the What works? guide to the evidence.",
  "home.eco.news": "News & research",
  "home.eco.newsText": "African news and open-access research on neurodivergence, updated every day.",
  "home.eco.apps": "Apps & tools",
  "home.eco.appsText": "Assistive tech and apps, rated by the community.",
  "home.eco.community": "Community",
  "home.eco.communityText": "Share experiences and find peer support in moderated spaces.",
  "home.eco.advocacy": "Advocacy",
  "home.eco.advocacyText": "Resources for pushing for inclusive schools and policy.",

  "home.commit.noDiagnosis": "No diagnosis needed",
  "home.commit.noDiagnosisText":
    "Start a support profile and a plan from what you already see at home or in class, then add assessments when you have them.",
  "home.commit.senses": "Your senses, your settings",
  "home.commit.sensesText":
    "Calm or vibrant colours, larger text, less motion and higher contrast, set once and kept on every page.",
  "home.commit.free": "Free where it counts",
  "home.commit.freeText":
    "The support directory, the research library, the What works? guide and the companion's prompts cost nothing.",

  "home.step.assess": "Assess",
  "home.step.assessText":
    "A guided, high-depth screening across autism, ADHD, learning, motor, sensory and executive function. It's screening, not a diagnosis.",
  "home.step.assessAction": "See what the screening covers",
  "home.step.understand": "Understand",
  "home.step.understandText":
    "Plain-language results, area by area, with a companion that explains what they mean and what to ask professionals.",
  "home.step.understandAction": "Open NeuRafiki",
  "home.step.plan": "Plan",
  "home.step.planText":
    "Turn what you learned into a support plan: strengths, what helps, and goals with a starting point, a target and a review date.",
  "home.step.planAction": "Build a support plan",
  "home.step.support": "Support",
  "home.step.supportText":
    "Bring parents, teachers and therapists into one team, and find schools, therapists and groups near you.",
  "home.step.supportAction": "Find support",
  "home.step.measure": "Measure",
  "home.step.measureText": "Log progress in a tap and see it in calm words: doing better, stable, or needs attention.",
  "home.step.measureAction": "Open your dashboard",
  "home.step.adapt": "Adapt",
  "home.step.adaptText":
    "See what changed, check in with NeuRafiki, and adjust the plan using what the evidence says works.",
  "home.step.adaptAction": "See what works",
  ...auth.en,
  ...common.en,
  ...about.en,
  ...donate.en,
} as const

export type MessageKey = keyof typeof en
