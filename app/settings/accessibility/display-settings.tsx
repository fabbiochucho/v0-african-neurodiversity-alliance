"use client"

import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  parsePreferences,
  PREFERENCE_OPTIONS,
  PREFERENCES_STORAGE_KEY,
  type PreferenceKey,
  type Preferences,
} from "@/lib/preferences"

const LABELS: Record<PreferenceKey, { title: string; hint: string }> = {
  visual: { title: "Visual mode", hint: "Calm removes decorative patterns and softens colour." },
  motion: { title: "Motion", hint: "Reduced turns off animations and smooth scrolling." },
  text: { title: "Text size", hint: "Makes all text larger." },
  contrast: { title: "Contrast", hint: "High contrast meets WCAG AAA for body text." },
  density: { title: "Spacing", hint: "More or less space between things." },
}

export function DisplaySettings() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [status, setStatus] = useState<string>("")

  useEffect(() => {
    try {
      setPrefs(parsePreferences(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) || "{}")))
    } catch {
      // ignore
    }
  }, [])

  async function update(key: PreferenceKey, value: string) {
    const next = parsePreferences({ ...prefs, [key]: value })
    setPrefs(next)
    applyPreferences(next)
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage blocked: still applied for this visit
    }
    const res = await fetch("/api/preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }).catch(
      () => null,
    )
    setStatus(res?.ok ? "Saved to your account and this browser." : "Saved in this browser.")
  }

  return (
    <div className="space-y-6">
      <fieldset className="space-y-2">
        <legend className="font-semibold">Light or dark</legend>
        <ThemeToggle />
      </fieldset>
      {(Object.keys(PREFERENCE_OPTIONS) as PreferenceKey[]).map((key) => (
        <fieldset key={key} className="space-y-2">
          <legend className="font-semibold">{LABELS[key].title}</legend>
          <p className="text-sm text-muted-foreground">{LABELS[key].hint}</p>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_OPTIONS[key].map((o) => (
              <label
                key={o.value}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                  prefs[key] === o.value ? "border-primary bg-primary/10 font-medium" : ""
                }`}
              >
                <input
                  type="radio"
                  name={key}
                  value={o.value}
                  checked={prefs[key] === o.value}
                  onChange={() => update(key, o.value)}
                  className="sr-only"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <p role="status" className="text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  )
}
