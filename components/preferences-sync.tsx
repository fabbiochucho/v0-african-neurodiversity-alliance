"use client"

import { useEffect } from "react"
import { applyPreferences, parsePreferences, PREFERENCES_STORAGE_KEY } from "@/lib/preferences"

/**
 * When signed in, brings the account's saved display preferences onto this
 * device (once per page load). The boot script has already applied the
 * local copy, so this only matters on a new device or after a change made
 * elsewhere.
 */
export function PreferencesSync() {
  useEffect(() => {
    // Signed-out visitors have no Supabase auth cookie: skip the request.
    if (!/sb-[^=]*-auth-token/.test(document.cookie)) return
    fetch("/api/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.preferences) return
        const prefs = parsePreferences(data.preferences)
        try {
          localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs))
        } catch {
          // storage blocked: still apply for this page
        }
        applyPreferences(prefs)
      })
      .catch(() => {})
  }, [])
  return null
}
