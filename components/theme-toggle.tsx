"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const

/**
 * Light / dark / system switch. next-themes persists the choice in
 * localStorage and sets the class from an inline script before paint, so
 * there's no flash; we only render the selected state after mount to avoid
 * a hydration mismatch.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div role="radiogroup" aria-label="Colour theme" className="inline-flex rounded-md border p-0.5 text-xs">
      {OPTIONS.map((o) => {
        const checked = mounted && theme === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => setTheme(o.value)}
            className={`rounded px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              checked ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
