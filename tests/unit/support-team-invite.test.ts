import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"
import { canSendEmail, hashInviteToken, inviteEmail, inviteLink, INVITE_TTL_DAYS, newInviteToken, sendInviteEmail } from "@/lib/support-team-invite"

const sql = readFileSync("scripts/034_support_team_lapse_and_invite_links.sql", "utf8")

describe("invite tokens and links", () => {
  it("issues unguessable tokens, stores only the hash, and expires in 7 days", () => {
    const now = new Date("2026-06-01T00:00:00Z")
    const a = newInviteToken(now)
    const b = newInviteToken(now)
    expect(a.token).not.toBe(b.token)
    expect(a.token.length).toBeGreaterThanOrEqual(43) // 32 random bytes, base64url
    expect(a.hash).toBe(hashInviteToken(a.token))
    expect(a.hash).not.toContain(a.token)
    expect(new Date(a.expiresAt).getTime() - now.getTime()).toBe(INVITE_TTL_DAYS * 86_400_000)
  })

  it("builds an accept link carrying the invite id and token", () => {
    const link = new URL(inviteLink("https://anda.example", "inv-1", "tok"))
    expect(link.pathname).toBe("/team/accept")
    expect(link.searchParams.get("invite")).toBe("inv-1")
    expect(link.searchParams.get("token")).toBe("tok")
  })

  it("escapes names in the email", () => {
    const { html, subject } = inviteEmail({ learnerName: "<b>Ada</b>", role: "teacher", inviterName: "Mum & Dad", link: "https://x/y?a=1&b=2" })
    expect(html).not.toContain("<b>Ada</b>")
    expect(html).toContain("&lt;b&gt;Ada&lt;/b&gt;")
    expect(html).toContain("Mum &amp; Dad")
    expect(subject).toContain("support team")
  })
})

describe("sending", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("sends nothing when RESEND_API_KEY is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "")
    expect(canSendEmail()).toBe(false)
    expect(await sendInviteEmail("a@b.co", { subject: "s", html: "h" })).toBe(false)
  })
})

describe("scripts/034", () => {
  it("member access requires the owner's current Pro+ plan (lapse removes it, renewal restores it)", () => {
    expect(sql).toMatch(/function public\.is_support_member[\s\S]*?public\.tier_allows\(m\.owner_id, 'pro'\)/)
  })

  it("accepting checks email, expiry and token; there is still no UPDATE policy", () => {
    expect(sql).toMatch(/invited_email = caller_email/)
    expect(sql).toMatch(/invite_expires_at > now\(\)/)
    expect(sql).toMatch(/invite_token_hash = token_hash/)
    expect(sql).not.toMatch(/for update/)
  })
})
