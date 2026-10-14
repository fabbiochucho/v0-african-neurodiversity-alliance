# Design system: "African Calm + Intelligent Warmth"

The tokens live in `app/globals.css` as shadcn CSS variables, exposed to Tailwind v4 through `@theme inline`. Use tokens (`bg-primary`, `text-muted-foreground`, `border-border`, `text-terracotta`) and never hard-coded hex values in components.

## Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#FAF7F2` warm off-white | `#1A1613` | page |
| `--foreground` | `#2B2420` warm charcoal | `#F3EDE4` | text |
| `--primary` | `#2A7A69` (AA-safe ANDA teal) | `#6CC2AE` | links, primary buttons |
| `--terracotta` | `#A3522F` (AA-safe) | `#E08E6D` | warm accent |
| `--brand-teal` / `--brand-terracotta` | `#2F8674` / `#B85F41` | same | large or decorative use only |
| `--muted-foreground` | `#6B5F57` | `#B8ADA2` | secondary text |

- The owner accepted the darker "ink" shades for text and buttons, because the exact brand colours fall just short of WCAG AA for small text.
- High-contrast mode (below) meets AAA for body text.

## Type

Fraunces for headings (h1–h3, `--font-display`) and Source Sans 3 for body (`--font-sans`). Both are self-hosted through `next/font`, latin subset, with `display: swap`.

## Principles

- **Person-centred cards, not KPI tiles.** Progress uses plain words (Doing better / Stable / Needs attention / New / Emerging / Consistent) in neutral chips, never red/green.
- **Calm states.** Errors read "Something didn't save. Your information is still here. Try again." with a retry (`app/error.tsx`, `lib/calm.ts`). Empty states use `components/empty-state.tsx` and always offer a next step.
- **Minimal motion.** Colour transitions only, no lifting shadows. Motion stops with the OS `prefers-reduced-motion` setting or the in-app "Reduced" setting.
- **Low bandwidth.** No heavy assets, self-hosted fonts, server-rendered pages.

## Theme and sensory settings

- **Light / dark / system:** a header toggle (`components/theme-toggle.tsx`, using next-themes) applies the choice before first paint.
- **`/settings/accessibility`** (`lib/preferences.ts`). These are stored in localStorage, and in `user_preferences` when signed in. An inline `<head>` script applies them before paint. Each one sets a data-attribute on `<html>`:

| Attribute | Values | Effect |
|---|---|---|
| `data-visual` | calm / balanced / vibrant | Calm removes patterns and gradients; Vibrant enriches decoration. Text colours never change. |
| `data-motion` | reduced / standard | reduced = same as prefers-reduced-motion |
| `data-text` | standard / large / xl | root font size 100 / 112.5 / 125% |
| `data-contrast` | standard / high | high = token set at ≥7:1 for body text (tested) |
| `data-density` | spacious / standard / compact | scales Tailwind's `--spacing` |

## Accessibility checklist

- Every control has a label.
- Status messages use `role="status"` or `role="alert"`.
- Never rely on colour alone.
- Keep focus rings visible (`ring` token).
- The header wraps instead of overflowing at large text sizes.
