import { describe, expect, it } from "vitest"
import { transactionMatchesRecord } from "@/lib/payments/flutterwave"

describe("transactionMatchesRecord", () => {
  const recorded = { tx_ref: "ANDA-SUB-123", amount: 9.99, currency: "USD" }

  it("matches when tx_ref, amount, and currency all line up", () => {
    expect(transactionMatchesRecord({ txRef: "ANDA-SUB-123", amount: 9.99, currency: "USD" }, recorded)).toBe(true)
  })

  it("tolerates a tiny floating point rounding difference in amount", () => {
    expect(transactionMatchesRecord({ txRef: "ANDA-SUB-123", amount: 9.990001, currency: "usd" }, recorded)).toBe(
      true,
    )
  })

  it("rejects a mismatched tx_ref (different transaction)", () => {
    expect(transactionMatchesRecord({ txRef: "SOMETHING-ELSE", amount: 9.99, currency: "USD" }, recorded)).toBe(
      false,
    )
  })

  it("rejects a mismatched amount (e.g. tampered client amount)", () => {
    expect(transactionMatchesRecord({ txRef: "ANDA-SUB-123", amount: 1, currency: "USD" }, recorded)).toBe(false)
  })

  it("rejects a mismatched currency", () => {
    expect(transactionMatchesRecord({ txRef: "ANDA-SUB-123", amount: 9.99, currency: "NGN" }, recorded)).toBe(false)
  })

  it("rejects when the verified transaction has no tx_ref at all", () => {
    expect(transactionMatchesRecord({ amount: 9.99, currency: "USD" }, recorded)).toBe(false)
  })

  it("rejects when the recorded row has no tx_ref (defensive)", () => {
    expect(
      transactionMatchesRecord({ txRef: "ANDA-SUB-123", amount: 9.99, currency: "USD" }, { ...recorded, tx_ref: "" }),
    ).toBe(false)
  })
})
