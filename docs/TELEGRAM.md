# ANDA on Telegram

A low-bandwidth way to use ANDA's reviewed answers (`docs/REVIEWED_ANSWERS.md`) from a phone: plain short messages
and buttons. Code: `lib/telegram.ts`, `app/api/telegram/*`, scripts/062.

- **Anyone** messaging the bot can type a question and get up to two reviewed answers, with "This helped / It didn't
  help" buttons. The crisis screen runs first on every message.
- **Linked chats** (Your account → Telegram → Link Telegram; a one-time link, valid 15 minutes) can also press
  "Send to an ANDA expert" when no answer covers it. The expert's reply comes back to the chat in full, plus the usual
  email notice. Replies to questions sent on the website only get a notice in Telegram.
- `/mine` counts their questions, `/stop` unlinks, `/help`.
- Private chats only; group messages are ignored. No AI is used on Telegram.

## Switching it on

1. In Telegram, message **@BotFather**, send `/newbot`, pick a name and a username ending in `bot`. Keep the token.
   Use a dev@becomechange.institute-owned Telegram account, not a personal one.
2. In Vercel (ANDA, Production) set `TELEGRAM_BOT_TOKEN` (sensitive), `TELEGRAM_BOT_USERNAME` (without `@`) and
   `TELEGRAM_WEBHOOK_SECRET` (`openssl rand -hex 32 | tr -d '\r\n'`), then redeploy.
3. Signed in as a super admin (or anyone with `features.edit`), run in the browser console on the live site:
   `fetch('/api/telegram/setup', { method: 'POST' }).then(r => r.json())` → `{ ok: true }`. This points the bot at
   `/api/telegram/webhook` and sets its command menu.
4. Add Telegram to the DPA register in the private repo (Telegram offers no DPA; record it as the person's own choice
   of channel, with what we send).

Unset `TELEGRAM_BOT_TOKEN` to switch it off: nothing is sent and the Account card disappears.
