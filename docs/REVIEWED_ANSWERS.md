# Reviewed answers and questions for an expert

ANDA's answers to everyday questions come from a library people at ANDA write and check, not from a model's general
knowledge (scripts/061, `lib/reviewed-answers.ts`).

- **The library** (`/admin/answers`, permission `answers.write`): a question, other ways people ask it, the answer and
  its sources. Saving creates a draft; editing an approved answer puts it back to draft.
- **Approval** (`clinical.approve`: super admins and the "Clinical reviewer" staff role): someone other than the writer approves. The database refuses a
  self-approval. Approved answers are re-checked after a year ("Re-check due").
- **Where it is used:**
  - `/ask` (free, no AI, signed out too) shows the approved answers verbatim with their sources and "Did this help?".
  - The AI companion adds matching approved answers to its prompt and lists them as sources (`docs/AI_BEHAVIOUR.md`).
- **Not covered:** a signed-in person sends the question to an expert (`/api/ask`, at most 3 open per person). The crisis
  screen runs first; a match shows the crisis reply straight away and the question is flagged to the top of
  `/admin/questions`. The reply is emailed as a notice (the text stays behind sign-in at `/ask/mine`). The expert can
  save the reply as a draft library answer, rewritten without personal details.
- **Search:** Postgres full-text search. An answer is returned only if it contains at least half of the question's
  words, so a near miss goes to an expert. If real questions miss too often, add embeddings (pgvector + Workers AI).

## Testing before rollout

1. **Retrieval** (CI, `tests/db/reviewed-answers.sql`): parent-style questions must find the right answer; drafts,
   retired answers and unrelated questions must return nothing. Add a case whenever a real question misses.
2. **Safety** (CI, `tests/unit/companion.test.ts`, `tests/unit/reviewed-answers.test.ts`): crisis wording is caught
   before any model or queue, and uncovered questions are routed to an expert instead of answered.
3. **Comprehension:** "Did this help?" counts per answer in `/admin/answers`; rewrite answers that people say didn't help.
4. **Outcome:** compare the check-ins of people who used an answer against those who didn't, with the clinician, before
   claiming any effect.

## Before switching on

- Write and approve a first set of answers (say 20) with the clinician reviewer, then add "Ask a question" to the
  navigation (it needs FR/PT drafts for the new key).
- Add the clinician in `/admin/staff` with the "Clinical reviewer" role (2FA required, like all staff).
