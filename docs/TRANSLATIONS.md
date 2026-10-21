# Translations

ANDA's public pages can be shown in English, French and Portuguese. Visitors choose with the language picker in the header; the choice is kept in the `anda-lang` cookie.

## Where the text lives

- `lib/i18n/messages/<area>.ts`: one file per page or area, with English, French and Portuguese side by side.
- `lib/i18n/en.ts`, `fr.ts`, `pt.ts`: the navigation, footer and home page, plus the list of area files.
- `lib/i18n/messages/pathways.ts`: French and Portuguese for the three pathways. The English is in `lib/pathways.ts`.
- Anything without a translation falls back to English.

French and Portuguese started as drafts written by an AI (October 2026). Portuguese uses European spelling, as in Angola, Mozambique, Cabo Verde, Guinea-Bissau and São Tomé and Príncipe.

## Getting a translation reviewed

1. Sign in as an admin and open **/admin/translations**. Select **Download CSV for translators**.
2. Send the CSV to a native speaker. They check each line and write any changes in the `french_corrected` or `portuguese_corrected` column, leaving it empty when the draft is right. Placeholders such as `{n}` or `{name}` must stay exactly as they are.
3. Apply the corrections to the files above (or give the CSV to Claude to apply).
4. When a language has been fully reviewed, add it to `REVIEWED_LANGUAGES` in `lib/i18n/index.ts`. That removes the "translated automatically" notice in that language.

## What stays in English

- **Legal pages** (privacy policy, terms, community guidelines, accessibility statement). They show a note in the visitor's language that the English version applies. A translated legal text needs a lawyer's review.
- **Signed-in pages** such as the dashboard and plans. Translate them the same way, one area file at a time.
- **Screening questions.** Questions adapted from validated screening tools must not be machine-translated. A screening tool needs a reviewed translation to stay meaningful.

## Adding a string

Add the English to the right area file, add the French and Portuguese drafts next to it, and use it with `tr("key")` (client components: `const tr = useT()`; server components: `t(key, vars, await getSiteLanguage())`). The unit tests check that placeholders match English and that every string has a French and Portuguese version.
