// A token signed by NeuRafiki (issuer "neurafiki", the same claims as
// ANDA's own request tokens) is accepted on both ANDA contract routes.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { exportPKCS8, exportSPKI, generateKeyPair, SignJWT } from "jose"

const LINK = { id: "link-1" }
const LEARNER = "3f1c2a7e-8b4d-4c1e-9a2b-1234567890ab"
const inserted: unknown[] = []

// Minimal chainable stand-in for the service-role Supabase client.
function table(name: string) {
  const q: Record<string, unknown> = {}
  for (const m of ["select", "eq"]) q[m] = () => q
  q.maybeSingle = async () => ({ data: name === "linked_accounts" ? LINK : name === "learner_profiles" ? { id: LEARNER } : null })
  q.insert = (row: unknown) => {
    inserted.push(row)
    return { select: () => ({ single: async () => ({ data: { id: "rec-1" }, error: null }) }) }
  }
  return q
}

vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => ({ from: table }) }))
vi.mock("@/lib/entitlements", async (orig) => ({
  ...(await orig<typeof import("@/lib/entitlements")>()),
  getEntitlement: async () => ({ tier: "pro", learnerLimit: 10, can: () => true }),
}))

let neurafikiPrivateKey: CryptoKey

beforeAll(async () => {
  const nr = await generateKeyPair("EdDSA", { extractable: true })
  const own = await generateKeyPair("EdDSA", { extractable: true })
  neurafikiPrivateKey = nr.privateKey as CryptoKey
  process.env.NEXT_PUBLIC_NEURAFIKI_APP_URL = "https://neurafiki.example"
  process.env.FEDERATION_NEURAFIKI_PUBLIC_KEY = (await exportSPKI(nr.publicKey)).replace(/\n/g, "\\n")
  process.env.FEDERATION_PRIVATE_KEY = (await exportPKCS8(own.privateKey)).replace(/\n/g, "\\n")
})

beforeEach(() => {
  inserted.length = 0
})

function neurafikiToken(scope: string, issuer = "neurafiki", key?: CryptoKey) {
  return new SignJWT({ requesting_user_id: "nr-user-1", target_remote_user_id: "anda-user-1", scope })
    .setProtectedHeader({ alg: "EdDSA" })
    .setIssuer(issuer)
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(key ?? neurafikiPrivateKey)
}

describe("GET /api/federation/entitlements", () => {
  it("accepts a NeuRafiki-signed token with scope 'entitlements'", async () => {
    const { GET } = await import("@/app/api/federation/entitlements/route")
    const res = await GET(new Request("https://anda/api/federation/entitlements", { headers: { Authorization: `Bearer ${await neurafikiToken("entitlements")}` } }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      product: "anda",
      plan: "pro",
      entitlements: { iep: true, goals: true, progress: true, reports: true, support_team: true },
    })
    expect(res.headers.get("cache-control")).toContain("max-age=300")
  })

  it("rejects the wrong scope, the wrong issuer, or a key that isn't NeuRafiki's", async () => {
    const { GET } = await import("@/app/api/federation/entitlements/route")
    const call = async (t: string) => (await GET(new Request("https://anda/x", { headers: { Authorization: `Bearer ${t}` } }))).status
    expect(await call(await neurafikiToken("check_in_summary"))).toBe(401)
    expect(await call(await neurafikiToken("entitlements", "alliance"))).toBe(401)
    const stranger = (await generateKeyPair("EdDSA")).privateKey as CryptoKey
    expect(await call(await neurafikiToken("entitlements", "neurafiki", stranger))).toBe(401)
  })
})

describe("POST /api/federation/check-in-summary", () => {
  const body = {
    learner_ref: LEARNER,
    date: "2026-10-10",
    goal_title: "Ask for a break",
    summary: "Calmer this week.",
    answers: [
      { question_id: "mood", answer: 4 },
      { question_id: "energy", answer: "low" },
    ],
  }

  it("accepts a NeuRafiki-signed token with scope 'check_in_summary' (no link scope needed) and stores kind check_in", async () => {
    const { POST } = await import("@/app/api/federation/check-in-summary/route")
    const res = await POST(
      new Request("https://anda/api/federation/check-in-summary", {
        method: "POST",
        headers: { Authorization: `Bearer ${await neurafikiToken("check_in_summary")}` },
        body: JSON.stringify(body),
      }),
    )
    expect(res.status).toBe(201)
    expect(inserted[0]).toMatchObject({ learner_id: LEARNER, kind: "check_in", record_type: "neurafiki_check_in" })
  })

  it("rejects free-text answers", async () => {
    const { POST } = await import("@/app/api/federation/check-in-summary/route")
    const res = await POST(
      new Request("https://anda/x", {
        method: "POST",
        headers: { Authorization: `Bearer ${await neurafikiToken("check_in_summary")}` },
        body: JSON.stringify({ ...body, answers: [{ question_id: "notes", answer: "She said her teacher..." }] }),
      }),
    )
    expect(res.status).toBe(400)
    expect(inserted).toHaveLength(0)
  })
})
