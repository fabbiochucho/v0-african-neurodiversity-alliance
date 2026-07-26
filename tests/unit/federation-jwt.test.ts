import { generateKeyPair, exportPKCS8, exportSPKI } from "jose"
import { beforeAll, describe, expect, it } from "vitest"

// jwt.ts pulls its keys from env vars via lib/federation/keys.ts, so a real
// (test-only) Ed25519 keypair is generated once and wired into
// FEDERATION_PRIVATE_KEY / FEDERATION_NEURAFIKI_PUBLIC_KEY before any module
// under test reads them.
let signLinkToken: typeof import("@/lib/federation/jwt").signLinkToken
let verifySiblingLinkToken: typeof import("@/lib/federation/jwt").verifySiblingLinkToken
let signRequestToken: typeof import("@/lib/federation/jwt").signRequestToken

beforeAll(async () => {
  // "Alliance" keypair - this app signs with its own private key.
  const alliance = await generateKeyPair("EdDSA", { extractable: true })
  process.env.FEDERATION_PRIVATE_KEY = (await exportPKCS8(alliance.privateKey)).replace(/\n/g, "\\n")

  // "Neu Rafiki" keypair - the sibling app; this app only holds its public key,
  // but verifySiblingLinkToken in this test signs with the matching private
  // key to simulate a token the sibling issued.
  const neurafiki = await generateKeyPair("EdDSA", { extractable: true })
  process.env.FEDERATION_NEURAFIKI_PUBLIC_KEY = (await exportSPKI(neurafiki.publicKey)).replace(/\n/g, "\\n")

  const jwt = await import("@/lib/federation/jwt")
  signLinkToken = jwt.signLinkToken
  verifySiblingLinkToken = jwt.verifySiblingLinkToken
  signRequestToken = jwt.signRequestToken

  // Stash the sibling's private key on globalThis for use in tests below
  // (can't easily re-export it from keys.ts, which only knows the public half).
  ;(globalThis as any).__neurafikiPrivateKey = neurafiki.privateKey
})

describe("signLinkToken / verifySiblingLinkToken", () => {
  it("round-trips a token signed by the sibling and verified by this app", async () => {
    const { SignJWT } = await import("jose")
    const token = await new SignJWT({ email: "user@example.com", scopes: ["assessment_sync"] })
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuer("neurafiki")
      .setSubject("remote-user-1")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign((globalThis as any).__neurafikiPrivateKey)

    const payload = await verifySiblingLinkToken(token)

    expect(payload.iss).toBe("neurafiki")
    expect(payload.sub).toBe("remote-user-1")
    expect(payload.email).toBe("user@example.com")
    expect(payload.scopes).toEqual(["assessment_sync"])
  })

  it("rejects a token signed with the wrong (this app's own) key", async () => {
    // signLinkToken signs with THIS app's private key, not the sibling's -
    // verifySiblingLinkToken must reject it since it checks against the
    // sibling's public key.
    const token = await signLinkToken({
      iss: "alliance",
      sub: "local-user-1",
      email: "user@example.com",
      scopes: ["assessment_sync"],
    })

    await expect(verifySiblingLinkToken(token)).rejects.toThrow()
  })

  it("rejects a token with the wrong issuer claim", async () => {
    const { SignJWT } = await import("jose")
    const token = await new SignJWT({ email: "user@example.com", scopes: [] })
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuer("alliance") // verifySiblingLinkToken requires issuer === "neurafiki"
      .setSubject("remote-user-1")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign((globalThis as any).__neurafikiPrivateKey)

    await expect(verifySiblingLinkToken(token)).rejects.toThrow()
  })

  it("rejects an expired token", async () => {
    const { SignJWT } = await import("jose")
    const token = await new SignJWT({ email: "user@example.com", scopes: [] })
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuer("neurafiki")
      .setSubject("remote-user-1")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 300)
      .sign((globalThis as any).__neurafikiPrivateKey)

    await expect(verifySiblingLinkToken(token)).rejects.toThrow()
  })
})

describe("signRequestToken", () => {
  it("produces a JWT with the expected claims and a short expiry", async () => {
    const { decodeJwt } = await import("jose")

    const token = await signRequestToken({
      iss: "alliance",
      requesting_user_id: "local-user-1",
      target_remote_user_id: "remote-user-1",
      scope: "assessment_sync",
    })

    const payload = decodeJwt(token)
    expect(payload.iss).toBe("alliance")
    expect(payload.requesting_user_id).toBe("local-user-1")
    expect(payload.target_remote_user_id).toBe("remote-user-1")
    expect(payload.scope).toBe("assessment_sync")
    expect(payload.exp).toBeDefined()
    expect(payload.iat).toBeDefined()
    expect(payload.exp! - payload.iat!).toBe(120) // 2m expiry
  })
})
