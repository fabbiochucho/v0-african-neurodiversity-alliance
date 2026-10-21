import { cookies } from "next/headers"
import { isSiteLanguage, SITE_LANGUAGE_COOKIE, type SiteLanguage } from "@/lib/i18n"

/** The visitor's chosen site language (cookie set by the language picker). */
export async function getSiteLanguage(): Promise<SiteLanguage> {
  const value = (await cookies()).get(SITE_LANGUAGE_COOKIE)?.value
  return isSiteLanguage(value) ? value : "en"
}
