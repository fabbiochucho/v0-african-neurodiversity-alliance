import { describe, expect, it } from "vitest"
import { isSiteLanguage, t } from "@/lib/i18n"
import { en } from "@/lib/i18n/en"
import { fr } from "@/lib/i18n/fr"
import { pt } from "@/lib/i18n/pt"

describe("site languages", () => {
  it("translates and falls back to English", () => {
    expect(t("nav.about", {}, "fr")).toBe("À propos")
    expect(t("nav.about", {}, "pt")).toBe("Sobre")
    expect(t("nav.about", {}, "xx")).toBe("About")
    expect(t("plan.title", { name: "Ada", plan: "PEI" }, "fr")).toBe("PEI de Ada")
  })

  it("only accepts known languages from the cookie", () => {
    expect(isSiteLanguage("fr")).toBe(true)
    expect(isSiteLanguage("de")).toBe(false)
    expect(isSiteLanguage(undefined)).toBe(false)
  })

  it("keeps the same placeholders as English", () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join()
    for (const dict of [fr, pt]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(vars(value!), key).toBe(vars(en[key as keyof typeof en]))
      }
    }
  })
})
