import { NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

const store: RateLimitStore = {}

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds (default: 15 * 60 * 1000)
  max: number // Max requests per window (default: 100)
  message: string // Message to return when limit exceeded
  statusCode: number // Status code to return (default: 429)
  skip?: (req: Request) => boolean // Skip rate limiting for certain requests
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  statusCode: 429,
}

export function createRateLimiter(options: Partial<RateLimitOptions> = {}) {
  const finalOptions = { ...defaultOptions, ...options }

  return (req: Request) => {
    // Get client IP
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const key = ip

    // Skip if configured to skip
    if (finalOptions.skip?.(req)) {
      return { success: true }
    }

    const now = Date.now()
    const record = store[key]

    if (!record) {
      store[key] = {
        count: 1,
        resetTime: now + finalOptions.windowMs,
      }
      return { success: true }
    }

    // Reset if window has passed
    if (now > record.resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + finalOptions.windowMs,
      }
      return { success: true }
    }

    // Increment count
    record.count++

    if (record.count > finalOptions.max) {
      return {
        success: false,
        status: finalOptions.statusCode,
        message: finalOptions.message,
      }
    }

    return { success: true }
  }
}

export function handleRateLimit(
  rateLimitResult: ReturnType<ReturnType<typeof createRateLimiter>>
) {
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.message },
      { status: rateLimitResult.status }
    )
  }
  return null
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of Object.entries(store)) {
    if (now > record.resetTime) {
      delete store[key]
    }
  }
}, 60 * 60 * 1000)
