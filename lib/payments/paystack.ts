// Thin wrapper around the real Paystack API. Mirrors lib/payments/flutterwave.ts's
// shape; signatureMatches and transactionMatchesRecord are provider-agnostic
// pure functions already defined there and reused here rather than duplicated.

import type { createServiceClient } from "@/lib/supabase/service"
import { transactionMatchesRecord, type VerifiedTransaction } from "@/lib/payments/flutterwave"
import { createHmac, timingSafeEqual } from "node:crypto"

const PAYSTACK_BASE_URL = "https://api.paystack.co"

/**
 * Constant-time comparison of the computed HMAC against Paystack's
 * `x-paystack-signature` header — a plain `!==` would leak a timing
 * side-channel an attacker could use to probe the secret byte by byte.
 */
export function signatureMatches(signature: string, expected: string): boolean {
  const a = new Uint8Array(Buffer.from(signature))
  const b = new Uint8Array(Buffer.from(expected))
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Computes the expected `x-paystack-signature` value for a raw webhook
 * request body: HMAC-SHA512 using PAYSTACK_SECRET_KEY, hex-encoded. Must be
 * computed over the exact raw bytes Paystack sent.
 */
export function computePaystackSignature(rawBody: string, secretKey: string): string {
  return createHmac("sha512", secretKey).update(rawBody).digest("hex")
}

export interface InitializePaystackPayload {
  reference: string
  amount: number // major currency unit (e.g. dollars) -- converted to the minor unit Paystack expects
  currency: string
  email: string
  callback_url: string
  metadata?: Record<string, unknown>
}

export interface PaystackInitializeResult {
  ok: boolean
  link?: string
  error?: string
}

/**
 * Calls Paystack's POST /transaction/initialize to create a real hosted
 * checkout link. Returns ok:false (never throws) on any failure so callers
 * can surface a clean error response.
 */
export async function initializePaystackPayment(payload: InitializePaystackPayload): Promise<PaystackInitializeResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    return { ok: false, error: "Paystack is not configured (missing PAYSTACK_SECRET_KEY)" }
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference: payload.reference,
        // Paystack amounts are in the smallest currency unit (e.g. kobo/cents).
        amount: Math.round(payload.amount * 100),
        currency: payload.currency,
        email: payload.email,
        callback_url: payload.callback_url,
        metadata: payload.metadata,
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok || !data?.status || !data.data?.authorization_url) {
      return { ok: false, error: data?.message || "Failed to initialize Paystack payment" }
    }

    return { ok: true, link: data.data.authorization_url as string }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to reach Paystack" }
  }
}

export interface PaystackVerifyResult {
  ok: boolean
  status?: string
  reference?: string
  amount?: number
  currency?: string
  raw?: unknown
  error?: string
}

/**
 * Calls Paystack's GET /transaction/verify/:reference — the only source of
 * truth for whether a transaction actually succeeded. Client-supplied query
 * params are only ever used as hints for which transaction to look up.
 */
export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    return { ok: false, error: "Paystack is not configured (missing PAYSTACK_SECRET_KEY)" }
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })

    const data = await response.json().catch(() => null)

    if (!response.ok || !data?.status || !data.data) {
      return { ok: false, error: data?.message || "Failed to verify Paystack transaction" }
    }

    return {
      ok: true,
      status: data.data.status,
      reference: data.data.reference,
      // Paystack reports amount in the minor unit -- convert back to major
      // unit so it compares directly against the amount we recorded.
      amount: typeof data.data.amount === "number" ? data.data.amount / 100 : undefined,
      currency: data.data.currency,
      raw: data.data,
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to reach Paystack" }
  }
}

/** Adapts a verified Paystack transaction to the shared matching shape. */
export function toVerifiedTransaction(verified: PaystackVerifyResult): VerifiedTransaction {
  return { status: verified.status, txRef: verified.reference, amount: verified.amount, currency: verified.currency }
}

export { transactionMatchesRecord }

/**
 * Shared success path for both the webhook and the /verify redirect: flips
 * a payment_transactions row from pending -> successful (only if it's still
 * pending) and, for a subscription purchase, activates the subscription.
 * Returns whether this call was the one that finalized it.
 */
export async function finalizeSuccessfulPaystackPayment(
  service: ReturnType<typeof createServiceClient>,
  recordedTx: { id: string; purpose: string | null; subscription_id: string | null; amount: number | null },
  paystackReference: string,
): Promise<boolean> {
  const { data: finalized } = await service
    .from("payment_transactions")
    .update({ status: "successful", provider: "paystack", paystack_reference: paystackReference })
    .eq("id", recordedTx.id)
    .eq("status", "pending")
    .select()
    .maybeSingle()

  if (!finalized) {
    return false
  }

  if (recordedTx.purpose === "subscription" && recordedTx.subscription_id) {
    await service
      .from("subscriptions")
      .update({
        status: "active",
        flutterwave_ref: paystackReference,
        amount_paid: recordedTx.amount,
        payment_date: new Date().toISOString(),
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", recordedTx.subscription_id)
  }

  return true
}
