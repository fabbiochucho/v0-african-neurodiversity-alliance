# AI behaviour

> **Provider (Oct 2026):** AI runs through `lib/ai.ts`. Free Cloudflare Workers AI (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_AI_TOKEN`, default model Llama 3.1 8B) is used when configured; Anthropic (`ANTHROPIC_API_KEY`) only if Cloudflare is not set. The consent screen names whichever provider is active, and switching provider asks families to consent again.

ANDA uses AI in two places only. Both run server-side through `lib/ai.ts` (provider above) and are switched off entirely while no provider is configured.

## 1. Companion chat (`/companion`, `app/api/companion`)

- **The default companion uses no AI.**
  - Check-in prompts, next-step nudges (a stalled goal, or a review date within 14 days) and encouragement are rules applied to the learner's own data (`lib/companion-nudges.ts`).
  - Resources are keyword matches against the real Learning directory. They are never invented.
  - This part is available on every plan.
- **Free-text chat:** Pro and above. It is capped per user at 20 messages a day on Pro and 40 on Institutional, plus 5 a minute.
- **Not a medical or diagnostic tool.** This is stated in the UI and in the system prompt (`lib/companion.ts`). The prompt forbids diagnosing, medication advice, and inventing facts, organisations or phone numbers.
- **Crisis handling:**
  - A keyword screen (`detectCrisis`) runs *before* the model. It covers self-harm, suicide, abuse and medical emergencies.
  - A match gets a fixed reply pointing to local emergency services, findahelpline.com, a trusted person and ANDA's Find Support directory. That message is never sent to the model.
  - Model refusals get a safe fixed reply.
  - Limitation: English keywords only.
- **No content storage.** The browser holds the conversation. The server records only (user, time) per message, for rate limits, and logs no message text.

## 2. IEP drafting (`/plan/[id]`, `app/api/plan/[learnerId]`)

- Pro and above, and only for someone with `manage_plan` on that learner.
- The model returns structured JSON (an output schema), which is then validated and trimmed (`parseAiDraft`).
- It is asked for practical, strengths-based drafts with no diagnoses, medication or clinical content. Baselines are never drafted by AI.
- **Drafts are not the plan.** AI text is stored with `source='ai'`, shown with an "AI draft" label, and stays editable. It joins the official plan only when a person with `approve` rights approves it. Database triggers stop AI text being inserted as approved, and only `approve_plan_items()` can record an approval. Every approval saves a version.
- Without AI, the same flow drafts goals from ANDA's existing goal-suggestion templates.

## Not a companion chatbot

The chat is a support tool for planning and finding help, not a companion chatbot in the sense of laws such as California SB 243: it has no persona or relationship features, it keeps no memory between sessions, it isn't offered to children (accounts are for parents, carers and professionals), and it starts every session with an "AI, not a person" notice. It still has a crisis protocol (above). If any of that changes, re-check those laws first.

## Consent for learner data

- Learner data reaches the AI only with **per-learner consent** from the learner's owner (`/companion/consent/[id]`).
- Consent is stored as append-only events with a wording version (currently `2026-10-v2`). Changing the wording requires people to agree again.
- **Sent:** first name only, active goals, a 30-day check-in summary, and (for plan drafting) the support profile text.
- **Never sent:** surname, age or date of birth, gender, country, selected support areas or diagnoses, uploaded documents, check-in notes, reports.
- Withdrawing takes effect from the next request, because consent is re-checked every time.
- Without consent, chat works with no learner data, and AI drafting is unavailable.
