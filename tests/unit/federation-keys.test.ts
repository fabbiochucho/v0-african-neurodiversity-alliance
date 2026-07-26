import { generateKeyPair, exportPKCS8, exportSPKI } from "jose"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getOwnPrivateKey, getSiblingPublicKey } from "@/lib/federation/keys"

const ORIGINAL_PRIVATE = process.env.FEDERATION_PRIVATE_KEY
const ORIGINAL_PUBLIC = process.env.FEDERATION_NEURAFIKI_PUBLIC_KEY

beforeEach(() => {
  delete process.env.FEDERATION_PRIVATE_KEY
  delete process.env.FEDERATION_NEURAFIKI_PUBLIC_KEY
})

afterEach(() => {
  process.env.FEDERATION_PRIVATE_KEY = ORIGINAL_PRIVATE
  process.env.FEDERATION_NEURAFIKI_PUBLIC_KEY = ORIGINAL_PUBLIC
})

describe("getOwnPrivateKey", () => {
  it("throws a clear error when FEDERATION_PRIVATE_KEY is unset", async () => {
    await expect(getOwnPrivateKey()).rejects.toThrow("FEDERATION_PRIVATE_KEY is not configured")
  })

  it("imports a valid PKCS8 PEM with \\n-escaped newlines", async () => {
    const { privateKey } = await generateKeyPair("EdDSA", { extractable: true })
    const pem = await exportPKCS8(privateKey)
    process.env.FEDERATION_PRIVATE_KEY = pem.replace(/\n/g, "\\n")

    await expect(getOwnPrivateKey()).resolves.toBeTruthy()
  })
})

describe("getSiblingPublicKey", () => {
  it("throws a clear error when FEDERATION_NEURAFIKI_PUBLIC_KEY is unset", async () => {
    await expect(getSiblingPublicKey()).rejects.toThrow("FEDERATION_NEURAFIKI_PUBLIC_KEY is not configured")
  })

  it("imports a valid SPKI PEM with \\n-escaped newlines", async () => {
    const { publicKey } = await generateKeyPair("EdDSA", { extractable: true })
    const pem = await exportSPKI(publicKey)
    process.env.FEDERATION_NEURAFIKI_PUBLIC_KEY = pem.replace(/\n/g, "\\n")

    await expect(getSiblingPublicKey()).resolves.toBeTruthy()
  })
})
