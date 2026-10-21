import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

// Public pages must have no serious or critical WCAG 2.2 A/AA violations.
// Runs in CI against `pnpm start` (see .github/workflows/ci.yml).
const PAGES = ["/", "/directory", "/community", "/news", "/learning", "/apps-tools", "/research", "/privacy", "/terms", "/accessibility", "/auth/login", "/auth/sign-up", "/donate", "/pathways/family", "/no-such-page", "/learning/what-works", "/settings/accessibility"]

for (const path of PAGES) {
  test(`accessibility: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" })
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical")
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([])
  })
}

// The home page in French and Portuguese: right <html lang>, translated text,
// and still no serious violations.
for (const [lang, heading] of [
  ["fr", "Comprendre chaque esprit."],
  ["pt", "Compreender cada mente."],
] as const) {
  test(`accessibility and language: / in ${lang}`, async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "anda-lang", value: lang, url: baseURL ?? "http://localhost:3000" }])
    await page.goto("/", { waitUntil: "networkidle" })
    await expect(page.locator("html")).toHaveAttribute("lang", lang)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading)
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([])
  })
}
