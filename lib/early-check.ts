// Early development check, 12-36 months (docs/EARLY_CHECK.md). Free, no AI, nothing stored.
//
// Written by ANDA for families in Africa and the global south. It covers the areas that early autism
// screening looks at (the M-CHAT-R/F was used as a reference for WHICH areas: shared attention,
// response to name, pointing, pretend play, loss of skills), but every question is ANDA's own,
// with local examples and cultural notes. No M-CHAT item is copied or reworded.
//
// NOT VALIDATED: there is no score or risk level. It flags areas worth a professional look and says
// when to go soon. ponytail: the "3 concerns" threshold is a starting rule, not a measured cut-off;
// replace it with the numbers from a validation study (docs/EARLY_CHECK.md) before claiming accuracy.

export type Answer = "yes" | "sometimes" | "no" | "unsure"

export interface CheckQuestion {
  id: string
  area: string // plain words, shown in the results
  text: string
  note?: string // a cultural or practical note shown under the question
  fromMonths: number // asked from this age
  concernWhen: "yes" | "no" // which answer is the worry
}

export const QUESTIONS: CheckQuestion[] = [
  { id: "name", area: "Responding to their name", fromMonths: 12, concernWhen: "no",
    text: "When someone in the family calls your child's name in a normal voice from across the room, do they usually look up or come?" },
  { id: "follow_point", area: "Following where you point", fromMonths: 12, concernWhen: "no",
    text: "If you point at something interesting, like a goat, a bird, an aeroplane or a passing motorbike, and say \"Look!\", does your child look at it?" },
  { id: "point_share", area: "Pointing to share interest", fromMonths: 14, concernWhen: "no",
    text: "Does your child point or reach towards something just to show you it is interesting, not only to ask for it?" },
  { id: "show", area: "Showing you things", fromMonths: 12, concernWhen: "no",
    text: "Does your child bring things to show you, or hold them up for you to see, like a stone, a leaf or a toy?" },
  { id: "look_share", area: "Looking at you to share", fromMonths: 12, concernWhen: "no",
    text: "When you play together or something exciting happens, does your child look at your face to share it with you, or to see how you feel?",
    note: "Many families teach children not to look straight at elders, out of respect. This question is only about play and shared moments, not about respect." },
  { id: "smile_back", area: "Smiling back", fromMonths: 12, concernWhen: "no",
    text: "If you smile at your child, do they smile back?" },
  { id: "copy", area: "Copying others", fromMonths: 12, concernWhen: "no",
    text: "Does your child copy what others do, like clapping, waving, sweeping or stirring a pot?" },
  { id: "pretend", area: "Pretend play", fromMonths: 18, concernWhen: "no",
    text: "Does your child pretend, like feeding a doll, carrying a \"baby\" on their back, cooking with an empty pot, or talking on a pretend phone?",
    note: "Any pretend play counts, with toys or with everyday things like sticks, bottles or cloth." },
  { id: "other_children", area: "Interest in other children", fromMonths: 18, concernWhen: "no",
    text: "Is your child interested in other children, such as brothers, sisters, cousins or neighbours' children: watching them, going near them or joining in?" },
  { id: "understands", area: "Understanding simple requests", fromMonths: 15, concernWhen: "no",
    text: "Does your child understand a simple request without you pointing, like \"bring your shoes\" or \"give it to Mama\"?",
    note: "In any language spoken at home." },
  { id: "words", area: "First words", fromMonths: 16, concernWhen: "no",
    text: "Does your child say at least a few words that you or others understand, in any language spoken at home?",
    note: "Learning more than one language at home does not cause a delay." },
  { id: "phrases", area: "Joining words together", fromMonths: 24, concernWhen: "no",
    text: "Does your child put two words together, like \"Mama come\" or \"more water\", in any language?" },
  { id: "walks", area: "Walking", fromMonths: 18, concernWhen: "no",
    text: "Does your child walk on their own?" },
  { id: "sounds", area: "Reactions to everyday sounds", fromMonths: 12, concernWhen: "yes",
    text: "Is your child very upset by everyday sounds, such as a generator, a blender, a motorbike or drums, much more than other children their age?" },
  { id: "repetitive", area: "Repeated movements", fromMonths: 12, concernWhen: "yes",
    text: "Does your child often flap their hands, rock, spin, or move their fingers near their eyes, again and again?" },
  { id: "lining_up", area: "Unusual play", fromMonths: 18, concernWhen: "yes",
    text: "Does your child spend a long time lining things up, spinning wheels or staring at one object, and get very upset if this is stopped?" },
  { id: "lost_skills", area: "Losing skills", fromMonths: 12, concernWhen: "yes",
    text: "Has your child stopped using words, gestures or other skills that they used to have?" },
  { id: "hearing", area: "Hearing", fromMonths: 12, concernWhen: "yes",
    text: "Do you, or anyone else, ever worry about your child's hearing?" },
  { id: "worry", area: "Your own concern", fromMonths: 12, concernWhen: "yes",
    text: "Are you, or someone who knows your child well, worried about how they are developing?",
    note: "A parent's or carer's worry is an important sign in itself." },
]

export const MIN_MONTHS = 12
export const MAX_MONTHS = 36
export const CONCERNS_FOR_CHECK = 3

export const questionsForAge = (months: number) => QUESTIONS.filter((q) => months >= q.fromMonths)

export type Level = "soon" | "check" | "watch"

export interface CheckResult {
  level: Level
  reasons: string[] // why "soon", in plain words
  concerns: string[] // areas answered with the worrying answer
  partly: string[] // "sometimes"
  unsure: string[]
  hearingCheck: boolean
  motorCheck: boolean
}

/** Pure: the next steps for these answers at this age. Unanswered questions count as unsure. */
export function evaluate(months: number, answers: Record<string, Answer | undefined>): CheckResult {
  const asked = questionsForAge(months)
  const is = (id: string, a: Answer) => asked.some((q) => q.id === id) && answers[id] === a
  const concerns = asked.filter((q) => answers[q.id] === q.concernWhen).map((q) => q.area)
  const partly = asked.filter((q) => answers[q.id] === "sometimes").map((q) => q.area)
  const unsure = asked.filter((q) => !answers[q.id] || answers[q.id] === "unsure").map((q) => q.area)

  // Signs that mean "see someone soon" whatever else is answered.
  const reasons: string[] = []
  if (is("lost_skills", "yes")) reasons.push("Your child has lost words or skills they used to have.")
  if (is("words", "no")) reasons.push("No words yet at 16 months or older.")
  if (is("phrases", "no")) reasons.push("Not joining two words together at 24 months or older.")
  if (is("name", "no") && (is("point_share", "no") || is("show", "no"))) {
    reasons.push("Not responding to their name, and not pointing or showing things to share.")
  }

  const hearingCheck = is("hearing", "yes") || is("name", "no") || is("words", "no")
  const motorCheck = is("walks", "no")
  // "Sometimes" counts as half a concern.
  const weight = concerns.length + partly.length / 2
  const level: Level = reasons.length > 0 ? "soon" : weight >= CONCERNS_FOR_CHECK || motorCheck ? "check" : "watch"
  return { level, reasons, concerns, partly, unsure, hearingCheck, motorCheck }
}

export const LEVEL_TEXT: Record<Level, { title: string; body: string }> = {
  soon: {
    title: "Please see a health professional soon",
    body: "Some of your answers are signs that a child should be seen soon. This does not mean your child is autistic or has a condition: many things can explain them. But early help makes a real difference, so please don't wait.",
  },
  check: {
    title: "A professional check would be a good idea",
    body: "Several of your answers are worth a closer look by someone trained in child development. This is not a diagnosis. Book a check when you can, and keep playing, talking and singing with your child in the meantime.",
  },
  watch: {
    title: "Nothing here needs urgent attention",
    body: "Your answers don't suggest an urgent concern. Children develop at different speeds. Do this check again in about 3 months, and talk to a health worker any time you are worried.",
  },
}
