import { expect, test, type Page } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"

// Signed-in journeys against a throwaway local Supabase (see the e2e-signed-in
// job in .github/workflows/ci.yml). Never point this at production: it signs
// up users and grants them paid plans with the service role key.
const LOCAL = process.env.E2E_LOCAL_SUPABASE === "1"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

const PASSWORD = "Test-password-123!"
const email = `e2e-${Date.now()}@example.test`

test.describe.configure({ mode: "serial" })
test.skip(!LOCAL || !/127\.0\.0\.1|localhost/.test(SUPABASE_URL), "needs the local Supabase stack (E2E_LOCAL_SUPABASE=1)")

async function signIn(page: Page) {
  await page.goto("/auth/login")
  await page.getByLabel("Email Address").fill(email)
  await page.getByLabel("Password").fill(PASSWORD)
  await page.getByRole("button", { name: "Sign In" }).click()
  await page.waitForURL("**/dashboard")
}

test("sign up", async ({ page }) => {
  await page.goto("/auth/sign-up")
  await page.getByLabel("First Name").fill("Ada")
  await page.getByLabel("Last Name").fill("Tester")
  await page.getByLabel("Email Address").fill(email)
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD)
  await page.getByLabel("Confirm Password").fill(PASSWORD)
  await page.getByRole("button", { name: "Create Account" }).click()
  await page.waitForURL("**/auth/sign-up-success")
})

test("sign in lands on the dashboard", async ({ page }) => {
  await signIn(page)
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back")
})

test("free plan: AI chat is locked", async ({ page }) => {
  await signIn(page)
  await page.goto("/companion")
  await expect(page.getByText("Available on Pro and above")).toBeVisible()
})

test("community: post a discussion", async ({ page }) => {
  await signIn(page)
  const title = `E2E post ${Date.now()}`
  await page.goto("/community")
  await page.getByRole("button", { name: "New Post" }).click()
  await page.getByLabel("Title").fill(title)
  await page.getByLabel("Message").fill("Posted by the signed-in end-to-end test.")
  await page.getByRole("button", { name: "Post", exact: true }).click()
  await expect(page.getByText("Failed to post. Please try again.")).toHaveCount(0)
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: title })).toBeVisible()
})

test("pro plan: AI chat unlocks", async ({ page }) => {
  // Grant Pro the way a successful payment does: an active subscription
  // plus a successful transaction (see entitled_tier in migration 032).
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  const { data: users, error: listError } = await admin.auth.admin.listUsers()
  expect(listError).toBeNull()
  const user = users.users.find((u) => u.email === email)
  expect(user).toBeTruthy()
  const { data: sub, error: subError } = await admin
    .from("subscriptions")
    .insert({ user_id: user!.id, tier: "pro", status: "active", renewal_date: new Date(Date.now() + 30 * 864e5).toISOString() })
    .select("id")
    .single()
  expect(subError).toBeNull()
  const { error: txError } = await admin
    .from("payment_transactions")
    .insert({ subscription_id: sub!.id, transaction_id: `e2e-${Date.now()}`, status: "successful", amount: 0 })
  expect(txError).toBeNull()

  await signIn(page)
  await page.goto("/companion")
  await expect(page.getByText("Available on Pro and above")).toHaveCount(0)
  // CI has no AI key, so a Pro user sees the "not switched on" message instead of the chat.
  await expect(page.getByText("AI chat isn't switched on yet")).toBeVisible()
})
