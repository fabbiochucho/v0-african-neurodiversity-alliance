import { describe, expect, it } from "vitest"
import { computePaystackSignature, signatureMatches, toVerifiedTransaction } from "@/lib/payments/paystack"
import { transactionMatchesRecord } from "@/lib/payments/flutterwave"

describe("computePaystackSignature / signatureMatches", () => {
  it("accepts a correctly computed signature", () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ANDA-PSTK-SUB-123" } })
    const expected = computePaystackSignature(body, "test-secret")
    expect(signatureMatches(expected, expected)).toBe(true)
  })

  it("rejects a signature computed with the wrong secret", () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "ANDA-PSTK-SUB-123" } })
    const real = computePaystackSignature(body, "test-secret")
    const wrong = computePaystackSignature(body, "wrong-secret")
    expect(signatureMatches(wrong, real)).toBe(false)
  })

  it("rejects a signature computed over a tampered body", () => {
    const original = computePaystackSignature(JSON.stringify({ data: { amount: 499 } }), "test-secret")
    const tampered = computePaystackSignature(JSON.stringify({ data: { amount: 999999 } }), "test-secret")
    expect(signatureMatches(tampered, original)).toBe(false)
  })
})

describe("toVerifiedTransaction", () => {
  it("maps a Paystack verify result into the shared matching shape", () => {
    const mapped = toVerifiedTransaction({
      ok: true,
      status: "success",
      reference: "ANDA-PSTK-SUB-123",
      amount: 4.99,
      currency: "USD",
    })
    expect(mapped).toEqual({ status: "success", txRef: "ANDA-PSTK-SUB-123", amount: 4.99, currency: "USD" })
  })
})

describe("transactionMatchesRecord (Paystack amounts, already converted to major units)", () => {
  const recorded = { tx_ref: "ANDA-PSTK-SUB-123", amount: 4.99, currency: "USD" }

  it("matches when the converted Paystack amount lines up with the recorded one", () => {
    expect(transactionMatchesRecord({ txRef: "ANDA-PSTK-SUB-123", amount: 4.99, currency: "USD" }, recorded)).toBe(
      true,
    )
  })

  it("rejects a tampered amount (e.g. a client claiming a lower charge went through)", () => {
    expect(transactionMatchesRecord({ txRef: "ANDA-PSTK-SUB-123", amount: 0.01, currency: "USD" }, recorded)).toBe(
      false,
    )
  })
})
