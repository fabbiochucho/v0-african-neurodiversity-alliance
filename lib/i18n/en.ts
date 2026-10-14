// English strings. Add other languages as sibling files with the same keys.
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
} as const

export type MessageKey = keyof typeof en
