// Thin wrapper around the real Flutterwave v3 API, plus the pure matching
// logic used to reconcile a verified transaction against our own
// server-recorded payment_transactions row.

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3"

export interface InitializePaymentPayload {
  tx_ref: string
  amount: number
  currency: string
  payment_options?: string
  redirect_url: string
  customer: { email: string; phonenumber?: string; name?: string }
  customizations: { title: string; description: string; logo?: string }
  meta?: Record<string, unknown>
}

export interface FlutterwaveInitializeResult {
  ok: boolean
  link?: string
  error?: string
}

/**
 * Calls Flutterwave's POST /v3/payments to create a real hosted payment
 * link. Returns ok:false (never throws) on any failure so callers can
 * surface a clean error response.
 */
export async function initializeFlutterwavePayment(
  payload: InitializePaymentPayload,
): Promise<FlutterwaveInitializeResult> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY

  if (!secretKey) {
    return { ok: false, error: "Flutterwave is not configured (missing FLUTTERWAVE_SECRET_KEY)" }
  }

  try {
    const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok || !data || data.status !== "success" || !data.data?.link) {
      return { ok: false, error: data?.message || "Failed to initialize Flutterwave payment" }
    }

    return { ok: true, link: data.data.link as string }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to reach Flutterwave" }
  }
}

export interface FlutterwaveVerifyResult {
  ok: boolean
  status?: string
  txRef?: string
  amount?: number
  currency?: string
  raw?: unknown
  error?: string
}

/**
 * Calls Flutterwave's GET /v3/transactions/{id}/verify — the only source of
 * truth for whether a transaction actually succeeded. Client-supplied query
 * params (status, transaction_id) must never be trusted on their own.
 */
export async function verifyFlutterwaveTransaction(transactionId: string): Promise<FlutterwaveVerifyResult> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY

  if (!secretKey) {
    return { ok: false, error: "Flutterwave is not configured (missing FLUTTERWAVE_SECRET_KEY)" }
  }

  try {
    const response = await fetch(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })

    const data = await response.json().catch(() => null)

    if (!response.ok || !data || data.status !== "success" || !data.data) {
      return { ok: false, error: data?.message || "Failed to verify Flutterwave transaction" }
    }

    return {
      ok: true,
      status: data.data.status,
      txRef: data.data.tx_ref,
      amount: data.data.amount,
      currency: data.data.currency,
      raw: data.data,
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to reach Flutterwave" }
  }
}

export interface RecordedTransaction {
  tx_ref: string
  amount: number | null
  currency: string | null
}

export interface VerifiedTransaction {
  status?: string
  txRef?: string
  amount?: number
  currency?: string
}

/**
 * Pure matching function: does a verified Flutterwave transaction actually
 * correspond to the payment_transactions row we recorded during initialize?
 * Extracted so it can be unit tested without hitting the network or the DB.
 */
export function transactionMatchesRecord(verified: VerifiedTransaction, recorded: RecordedTransaction): boolean {
  if (!verified.txRef || !recorded.tx_ref || verified.txRef !== recorded.tx_ref) {
    return false
  }

  if (recorded.amount != null) {
    if (verified.amount == null || Math.abs(verified.amount - recorded.amount) > 0.01) {
      return false
    }
  }

  if (recorded.currency && verified.currency && verified.currency.toUpperCase() !== recorded.currency.toUpperCase()) {
    return false
  }

  return true
}
