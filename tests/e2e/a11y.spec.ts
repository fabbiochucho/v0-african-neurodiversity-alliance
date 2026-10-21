import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

// Public pages must have no serious or critical WCAG 2.2 A/AA violations.
// Runs in CI against `pnpm start` (see .github/workflows/ci.yml). Waits for
// "load", then up to 5s for the network to settle: pages with many outside
// images (e.g. /learning book covers) may never go fully network-idle in CI.
const PAGES = ["/", "/directory", "/community", "/news", "/learning", "/apps-tools", "/research", "/privacy", "/terms", "/accessibility", "/auth/login", "/auth/sign-up", "/donate", "/pathways/family", "/no-such-page", "/learning/what-works", "/settings/accessibility"]

for (const path of PAGES) {
  test(`accessibility: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: "load" })
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {})
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical")
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([])
  })
}
