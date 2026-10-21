"use client"

import { createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { SITE_LANGUAGE_COOKIE, SITE_LANGUAGES, t, type MessageKey, type SiteLanguage } from "@/lib/i18n"

const LanguageContext = createContext<SiteLanguage>("en")

export function LanguageProvider({ lang, children }: { lang: SiteLanguage; children: React.ReactNode }) {
  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>
}

/** Translator for client components: const tr = useT(); tr("nav.about") */
export function useT() {
  const lang = useContext(LanguageContext)
  return (key: MessageKey, vars?: Record<string, string | number>) => t(key, vars, lang)
}

export function LanguagePicker({ id }: { id: string }) {
  const lang = useContext(LanguageContext)
  const router = useRouter()
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <label htmlFor={id} className="sr-only">
        {t("i18n.language", {}, lang)}
      </label>
      <select
        id={id}
        value={lang}
        className="rounded-md border bg-background px-2 py-1"
        onChange={(e) => {
          document.cookie = `${SITE_LANGUAGE_COOKIE}=${e.target.value}; path=/; max-age=31536000; samesite=lax`
          router.refresh()
        }}
      >
        {SITE_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </span>
  )
}

/** Shown on every page when a non-English language is chosen. */
export function DraftTranslationNotice() {
  const lang = useContext(LanguageContext)
  if (lang === "en") return null
  return (
    <p role="note" className="bg-secondary px-4 py-2 text-center text-sm">
      {t("i18n.draftNotice", {}, lang)}
    </p>
  )
}

/** On legal pages, which stay in English: says the English version applies. */
export function EnglishOnlyNote() {
  const lang = useContext(LanguageContext)
  if (lang === "en") return null
  return (
    <p role="note" lang={lang} className="container mx-auto px-4 pt-6 text-sm text-muted-foreground">
      {t("common.legalEnglishApplies", {}, lang)}
    </p>
  )
}

/** The current site language code, e.g. for Intl date formatting. */
export function useLang(): SiteLanguage {
  return useContext(LanguageContext)
}
