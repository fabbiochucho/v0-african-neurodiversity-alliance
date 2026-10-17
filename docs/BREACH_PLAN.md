# Breach plan

One page for the day something goes wrong. It covers ANDA and NeuRafiki.

## Who decides

- **Lead:** Abiola Oshunniyi, Data Protection Officer (dpo@becomechange.institute, +2348188466444). Decides whether it's a breach and who must be told.
- **Technical:** whoever holds the Supabase and Vercel access contains it, keeps evidence, and writes the timeline.
- **Lawyer:** _name and number to be filled in by the owner._

## First hour

1. Contain it: rotate the exposed keys (Supabase service role, Flutterwave/Paystack, Resend/SMTP, Cloudflare, `CRON_SECRET`, federation keys) in Vercel and redeploy. Disable the affected route or feature if needed.
2. Keep evidence: Supabase logs, Vercel logs and the `audit_log` table. Don't delete anything.
3. Write down what happened, when it started, what data and whose (adults, children, health or development information).

## Deadlines

- **Nigeria (NDPA):** tell the Nigeria Data Protection Commission within 72 hours of becoming aware, and tell affected people without undue delay when the risk to them is high.
- **EU/UK users (GDPR):** the supervisory authority within 72 hours; affected people without undue delay if the risk is high.
- **Other countries (Kenya, Ghana, South Africa, the US and so on):** ask the lawyer on day one. Many have their own deadlines.

Data that reaches a third party without permission (an AI provider, an analytics tool, a wrong recipient) counts as a breach here too.

## Telling people

Email affected account holders from the app's sender: what happened, what data, what we've done, what they should do, and who to contact (dpo@becomechange.institute). Post a notice on the site if many people are affected.

## Afterwards

Write up the cause and the fix in the repo. Re-run the launch checklist for the stages it touched.
