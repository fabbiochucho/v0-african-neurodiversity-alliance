import { expect, test } from "@playwright/test"

// Smoke test: sign in -> generate an IEP -> see it appear on /iep/dashboard.
//
// This exercises real Supabase auth and real API routes, so it needs a
// seeded test user in the target Supabase project:
//   PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD
//
// We intentionally do not mock Supabase auth at the network layer here: the
// IEP dashboard/progress/reports pages are React Server Components that call
// supabase.auth.getUser() during SSR using the session cookie, which page.route()
// browser-level interception cannot fake. A real (test) account is the
// simplest thing that actually proves the flow works end-to-end. If no test
// credentials are configured, the test skips instead of failing so the suite
// stays green in environments (like CI without secrets) that can't run it.
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD

test.describe("IEP generation smoke test", () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, "PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD not configured")

  test("sign in, generate an IEP, and see it on the dashboard", async ({ page }) => {
    const learnerName = `Playwright Test Learner ${Date.now()}`

    // 1. Sign in
    await page.goto("/auth/login")
    await page.getByLabel("Email Address").fill(TEST_EMAIL!)
    await page.getByLabel("Password").fill(TEST_PASSWORD!)
    await page.getByRole("button", { name: /sign in/i }).click()
    await page.waitForURL("**/protected")

    // 2. Generate a new IEP
    await page.goto("/iep/generate")
    await page.getByPlaceholder("Enter learner's name").fill(learnerName)
    await page.getByPlaceholder("Enter age").fill("9")
    await page.getByPlaceholder("Enter country").fill("Nigeria")
    await page.getByRole("button", { name: /next: select diagnosis domains/i }).click()

    await page.getByText("ASD", { exact: true }).click()
    await page.getByRole("button", { name: /generate adaptive goals/i }).click()

    await page.getByRole("button", { name: /review & create iep/i }).click()
    await page.getByRole("button", { name: /create iep/i }).click()

    // 3. Confirm it shows up on the dashboard
    await page.waitForURL("**/iep/dashboard")
    await expect(page.getByText(learnerName)).toBeVisible()
  })
})
