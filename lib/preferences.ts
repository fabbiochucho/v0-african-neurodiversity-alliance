// Sensory / display preferences (brief §31). Applied as data-attributes on
// <html>; app/globals.css maps each attribute to design tokens.

export const PREFERENCE_OPTIONS = {
  visual: [
    { value: "calm", label: "Calm" },
    { value: "balanced", label: "Balanced" },
    { value: "vibrant", label: "Vibrant" },
  ],
  motion: [
    { value: "reduced", label: "Reduced" },
    { value: "standard", label: "Standard" },
  ],
  text: [
    { value: "standard", label: "Standard" },
    { value: "large", label: "Large" },
    { value: "xl", label: "Extra large" },
  ],
  contrast: [
    { value: "standard", label: "Standard" },
    { value: "high", label: "High" },
  ],
  density: [
    { value: "spacious", label: "Spacious" },
    { value: "standard", label: "Standard" },
    { value: "compact", label: "Compact" },
  ],
} as const

export type PreferenceKey = keyof typeof PREFERENCE_OPTIONS
export type Preferences = { [K in PreferenceKey]: (typeof PREFERENCE_OPTIONS)[K][number]["value"] }

export const DEFAULT_PREFERENCES: Preferences = {
  visual: "balanced",
  motion: "standard",
  text: "standard",
  contrast: "standard",
  density: "standard",
}

export const PREFERENCES_STORAGE_KEY = "anda-display-prefs"

/** Fills defaults and drops anything that isn't a known option. */
export function parsePreferences(raw: unknown): Preferences {
  const out = { ...DEFAULT_PREFERENCES }
  if (!raw || typeof raw !== "object") return out
  for (const key of Object.keys(PREFERENCE_OPTIONS) as PreferenceKey[]) {
    const v = (raw as Record<string, unknown>)[key]
    if ((PREFERENCE_OPTIONS[key] as readonly { value: string }[]).some((o) => o.value === v)) {
      ;(out as Record<string, string>)[key] = v as string
    }
  }
  return out
}

/** DB row (scripts/043) <-> Preferences; the DB column for text is text_size. */
export function fromRow(row: Record<string, unknown> | null): Preferences | null {
  return row ? parsePreferences({ ...row, text: row.text_size }) : null
}

export function toRow(p: Preferences) {
  return { visual: p.visual, motion: p.motion, text_size: p.text, contrast: p.contrast, density: p.density }
}

export function applyPreferences(p: Preferences, el: HTMLElement = document.documentElement) {
  for (const key of Object.keys(PREFERENCE_OPTIONS) as PreferenceKey[]) el.dataset[key] = p[key]
}

/**
 * Inline <head> script: applies saved preferences before first paint so
 * there's no flash (same idea as next-themes). Kept tiny and dependency-free.
 */
export const PREFERENCES_BOOT_SCRIPT = `(function(){try{var d=${JSON.stringify(DEFAULT_PREFERENCES)};var o=${JSON.stringify(
  Object.fromEntries(Object.entries(PREFERENCE_OPTIONS).map(([k, v]) => [k, v.map((x) => x.value)])),
)};var s=JSON.parse(localStorage.getItem(${JSON.stringify(PREFERENCES_STORAGE_KEY)})||"{}");var e=document.documentElement;for(var k in d){e.dataset[k]=o[k].indexOf(s[k])>-1?s[k]:d[k]}}catch(_){}})()`
