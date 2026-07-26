import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { initializeFlutterwavePayment, verifyFlutterwaveTransaction } from "@/lib/payments/flutterwave"

const ORIGINAL_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY

beforeEach(() => {
  process.env.FLUTTERWAVE_SECRET_KEY = "test-secret-key"
})

afterEach(() => {
  process.env.FLUTTERWAVE_SECRET_KEY = ORIGINAL_SECRET_KEY
  vi.unstubAllGlobals()
})

const basePayload = {
  tx_ref: "ANDA-SUB-1",
  amount: 9.99,
  currency: "USD",
  redirect_url: "https://example.com/api/payments/flutterwave/verify",
  customer: { email: "user@example.com" },
  customizations: { title: "ANDA premium", description: "premium tier" },
}

describe("initializeFlutterwavePayment", () => {
  it("returns ok:false without calling fetch when FLUTTERWAVE_SECRET_KEY is missing", async () => {
    delete process.env.FLUTTERWAVE_SECRET_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const result = await initializeFlutterwavePayment(basePayload)

    expect(result).toEqual({ ok: false, error: expect.stringContaining("FLUTTERWAVE_SECRET_KEY") })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns the payment link on a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "success", data: { link: "https://checkout.flutterwave.com/abc" } }),
      }),
    )

    const result = await initializeFlutterwavePayment(basePayload)

    expect(result).toEqual({ ok: true, link: "https://checkout.flutterwave.com/abc" })
  })

  it("surfaces Flutterwave's error message on a failed response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ status: "error", message: "Invalid amount" }),
      }),
    )

    const result = await initializeFlutterwavePayment(basePayload)

    expect(result).toEqual({ ok: false, error: "Invalid amount" })
  })

  it("never throws when the network call itself fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    )

    const result = await initializeFlutterwavePayment(basePayload)

    expect(result).toEqual({ ok: false, error: "network down" })
  })

  it("never throws when the response body isn't valid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("not json")
        },
      }),
    )

    const result = await initializeFlutterwavePayment(basePayload)

    expect(result.ok).toBe(false)
  })
})

describe("verifyFlutterwaveTransaction", () => {
  it("returns ok:false without calling fetch when FLUTTERWAVE_SECRET_KEY is missing", async () => {
    delete process.env.FLUTTERWAVE_SECRET_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const result = await verifyFlutterwaveTransaction("12345")

    expect(result.ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns the verified transaction fields on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "success",
          data: { status: "successful", tx_ref: "ANDA-SUB-1", amount: 9.99, currency: "USD" },
        }),
      }),
    )

    const result = await verifyFlutterwaveTransaction("12345")

    expect(result).toMatchObject({ ok: true, status: "successful", txRef: "ANDA-SUB-1", amount: 9.99, currency: "USD" })
  })

  it("returns ok:false when Flutterwave reports the transaction wasn't found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ status: "error", message: "No transaction was found for this id" }),
      }),
    )

    const result = await verifyFlutterwaveTransaction("does-not-exist")

    expect(result).toEqual({ ok: false, error: "No transaction was found for this id" })
  })
})
