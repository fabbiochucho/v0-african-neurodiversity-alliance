// Reviewed answers (scripts/061, docs/REVIEWED_ANSWERS.md): ANDA answers from answers a person
// wrote and someone else approved, and sends anything the library doesn't cover to an expert.
// Used by /ask, the AI companion and (later) Telegram. Pure helpers here; callers do the I/O.

export const MAX_QUESTION_CHARS = 1000
export const MAX_OPEN_QUESTIONS = 3 // per person, so the expert queue stays answerable
export const REVIEW_AFTER_DAYS = 365

export interface ReviewedAnswer {
  id: string
  question: string
  answer: string
  sources: string
  lang: string
  review_level?: "evidence" | "clinical"
  coverage?: number
}

/** Shown with every answer, so people know exactly how it was checked. */
export const REVIEW_LABEL = {
  evidence: "Written from WHO guidance and published research, and checked by ANDA. Not yet reviewed by a clinician.",
  clinical: "Written from WHO guidance and published research, and reviewed by a clinician.",
} as const
export const reviewLabel = (a: Pick<ReviewedAnswer, "review_level">) => REVIEW_LABEL[a.review_level === "clinical" ? "clinical" : "evidence"]

/** Shown with every answer on every channel: ANDA's answers never replace an assessment. */
export const DIAGNOSIS_NOTE =
  "This is general information, not a diagnosis. Only a qualified professional (a doctor, paediatrician, child psychologist, psychiatrist or developmental specialist) can assess and diagnose. If you're worried, ask a health worker or clinic for a referral, or find a service in ANDA's Find Support directory."

type Rpc = {
  rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }>
}

/** Approved answers that cover the question; [] when none do, or on any error. */
export async function findReviewedAnswers(db: Rpc, question: string, max = 3): Promise<ReviewedAnswer[]> {
  const q = question.trim()
  if (!q) return []
  const { data, error } = await db.rpc("search_reviewed_answers", { q: q.slice(0, 500), max_results: max })
  if (error) {
    console.error("reviewed answers search failed")
    return []
  }
  return (data ?? []) as ReviewedAnswer[]
}

/**
 * Added to the companion's system prompt when reviewed answers cover the question, so the
 * reply stays inside what people at ANDA have checked and names where it came from.
 */
export function groundingPrompt(answers: ReviewedAnswer[]): string {
  if (answers.length === 0) {
    return `No ANDA reviewed answer covers this question. Say so in one short sentence, keep any general suggestions brief and practical, and tell the person they can send the question to an ANDA expert at /ask.`
  }
  const blocks = answers.map((a, i) => `[${i + 1}] ${a.question}\n${a.answer}${a.sources ? `\nSources: ${a.sources}` : ""}`)
  return `ANDA reviewed answers that cover this question (written and checked by people at ANDA):
${blocks.join("\n\n")}

Base your reply on these. Don't add facts, numbers or advice that they don't contain. Name the answer you used, like "(ANDA reviewed answer [1])". If they don't fully answer the question, say what is missing and suggest sending it to an ANDA expert at /ask. Where a worry about development, behaviour or health comes up, encourage getting an assessment from a qualified professional; never suggest that ANDA's answers replace one.`
}

export function reviewDueDate(from: Date = new Date()): string {
  return new Date(from.getTime() + REVIEW_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string)

/** Email telling the person their question has an answer. The answer itself stays on ANDA, behind sign-in. */
export function answeredEmail(link: string) {
  const subject = "An ANDA expert has answered your question"
  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#2b2420;max-width:560px;margin:0 auto;padding:20px">
<h1 style="font-size:20px">Your question has an answer</h1>
<p>Someone at ANDA (African Neurodiversity Alliance) has replied to the question you sent.</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;background:#2a7a69;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Read the answer</a></p>
<p style="font-size:13px;color:#6b5f57">You'll need to sign in. ANDA's answers are general guidance, not a diagnosis or treatment plan.</p>
</body></html>`
  return { subject, html }
}
