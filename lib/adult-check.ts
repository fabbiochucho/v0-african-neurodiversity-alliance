// Adult self-check (docs/ADULT_CHECK.md): for adults who wonder whether they are neurodivergent and were never
// assessed. Free, no AI, nothing stored.
//
// ANDA's own questions, with everyday examples from African life. They cover the areas adult assessments look at
// (autism, ADHD, dyslexia, dyscalculia, dyspraxia, tics); no item is copied or reworded from AQ-10, RAADS, ASRS or
// any other screener. NOT VALIDATED: each area says only "worth exploring" or not.
// ponytail: "half the area's questions answered often or very often" is a starting rule, not a measured cut-off;
// replace it with numbers from a validation study before claiming accuracy.

export type Freq = "never" | "rarely" | "sometimes" | "often" | "very_often"

export const FREQ_OPTIONS: { value: Freq; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often" },
  { value: "very_often", label: "Very often" },
]

export type AreaId = "autism" | "adhd" | "reading" | "numbers" | "coordination" | "tics" | "wellbeing"

export const AREAS: Record<AreaId, { label: string; explore: string }> = {
  autism: {
    label: "Social communication, senses and routines (autism)",
    explore: "Your answers fit patterns that are common in autistic adults. An assessment by a psychiatrist or clinical psychologist experienced with adults can tell you more.",
  },
  adhd: {
    label: "Attention, restlessness and impulsivity (ADHD)",
    explore: "Your answers fit patterns that are common in adults with ADHD. An assessment will also ask about your childhood, because ADHD starts in childhood.",
  },
  reading: {
    label: "Reading and spelling (dyslexia)",
    explore: "Your answers fit patterns common in dyslexia. An educational psychologist, or a learning support service at a university or college, can assess this.",
  },
  numbers: {
    label: "Numbers and everyday maths (dyscalculia)",
    explore: "Your answers fit patterns common in dyscalculia. An educational psychologist can assess this.",
  },
  coordination: {
    label: "Movement and coordination (dyspraxia)",
    explore: "Your answers fit patterns common in dyspraxia (developmental coordination disorder). A doctor can refer you to an occupational therapist or physiotherapist.",
  },
  tics: {
    label: "Tics",
    explore: "Tics that have lasted more than a year can be part of Tourette syndrome or a tic disorder. A doctor or neurologist can assess this.",
  },
  wellbeing: {
    label: "Low mood or anxiety",
    explore: "You've been feeling low or anxious on most days. This is common, it can be treated, and it often comes alongside neurodivergence. Please talk to a health worker.",
  },
}

export interface AdultQuestion {
  id: string
  area: AreaId
  text: string
  childhood?: boolean // asks about school or childhood
}

export const ADULT_QUESTIONS: AdultQuestion[] = [
  // Autism
  { id: "a_social_effort", area: "autism", text: "Conversations, greetings and small talk take a lot of effort, and you feel worn out after social gatherings such as weddings, funerals, church, mosque or family events." },
  { id: "a_blunt", area: "autism", text: "People tell you that you come across as rude, blunt or distant when you didn't mean to." },
  { id: "a_hints", area: "autism", text: "You find it hard to tell what people mean when they hint, tease, or say one thing and mean another." },
  { id: "a_masking", area: "autism", text: "You copy how others behave, or plan what to say in advance, so that you fit in, and it tires you out." },
  { id: "a_senses", area: "autism", text: "Sounds, lights, smells or textures that others hardly notice, such as a generator, market noise, strong perfume or certain clothes, feel overwhelming or painful." },
  { id: "a_change", area: "autism", text: "Unexpected changes to plans or routines upset you much more than they seem to upset other people." },
  { id: "a_interests", area: "autism", text: "You have deep interests that you focus on for hours, much more intensely than people around you." },
  // ADHD
  { id: "d_attention", area: "adhd", text: "You find it hard to keep your attention on things that bore you, such as paperwork, long meetings or sermons, even when they matter." },
  { id: "d_losing", area: "adhd", text: "You lose or misplace things you need, such as keys, your phone or documents." },
  { id: "d_finishing", area: "adhd", text: "You start many things but find it hard to finish them, or you leave tasks to the last minute even when it causes you problems." },
  { id: "d_restless", area: "adhd", text: "You feel restless inside, fidget, or find it hard to stay seated when you are expected to." },
  { id: "d_impulsive", area: "adhd", text: "You act or speak on impulse, such as interrupting, spending or deciding quickly, and regret it later." },
  { id: "d_childhood", area: "adhd", childhood: true, text: "As a child, teachers or family often said you were restless, a daydreamer, careless, or \"not trying hard enough\"." },
  // Reading
  { id: "r_slow", area: "reading", text: "Reading takes you much longer than other people, or you need to read things several times to understand them." },
  { id: "r_spelling", area: "reading", text: "Spelling is hard for you, even for common words, or you avoid writing in front of others." },
  { id: "r_order", area: "reading", text: "You mix up the order of letters, numbers or words, for example when copying a phone number or an account number." },
  { id: "r_school", area: "reading", childhood: true, text: "At school, reading and writing were much harder for you than for classmates, even though you tried." },
  // Numbers
  { id: "n_everyday", area: "numbers", text: "Everyday maths, such as working out change, sharing a bill or judging how long something will take, is harder for you than for others." },
  { id: "n_remember", area: "numbers", text: "You find it hard to remember numbers such as PINs, dates or phone numbers." },
  { id: "n_school", area: "numbers", childhood: true, text: "At school, maths was much harder for you than other subjects, even though you tried." },
  // Coordination
  { id: "c_clumsy", area: "coordination", text: "People call you clumsy: you trip, bump into things or drop things more than others do." },
  { id: "c_hands", area: "coordination", text: "Tasks that need careful hand movements, such as neat handwriting, buttons, using tools or plaiting hair, are hard for you." },
  { id: "c_learning", area: "coordination", childhood: true, text: "Learning physical skills, such as riding a bicycle, a new dance or driving, took you much longer than others." },
  // Tics
  { id: "t_tics", area: "tics", text: "You have movements or sounds you feel an urge to make and can't fully stop, such as blinking, shrugging, throat-clearing or sniffing, and they have lasted more than a year." },
  // Wellbeing (signposting only)
  { id: "w_low", area: "wellbeing", text: "Over the last two weeks, you have felt down or hopeless, or lost interest in things you usually enjoy, on most days." },
  { id: "w_anxious", area: "wellbeing", text: "Over the last two weeks, you have felt nervous, worried or on edge on most days." },
]

const present = (f: Freq | undefined) => f === "often" || f === "very_often"

export interface AdultResult {
  explore: AreaId[] // areas worth exploring, in the order above
  counts: Record<AreaId, { present: number; asked: number }>
  wellbeing: boolean
}

/** Pure. An area is worth exploring when at least half its questions are answered often or very often. */
export function evaluateAdult(answers: Record<string, Freq | undefined>): AdultResult {
  const counts = Object.fromEntries(
    (Object.keys(AREAS) as AreaId[]).map((area) => {
      const qs = ADULT_QUESTIONS.filter((q) => q.area === area)
      return [area, { present: qs.filter((q) => present(answers[q.id])).length, asked: qs.length }]
    }),
  ) as AdultResult["counts"]
  // Wellbeing is a signpost: either question is enough.
  const wellbeing = counts.wellbeing.present > 0
  const explore = (Object.keys(AREAS) as AreaId[]).filter((a) =>
    a === "wellbeing" ? wellbeing : counts[a].present > 0 && counts[a].present * 2 >= counts[a].asked,
  )
  return { explore, counts, wellbeing }
}
