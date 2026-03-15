// In-memory rate limiting store (for serverless, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

const AUTH_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
};

const API_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

export const checkRateLimit = (identifier: string, config: RateLimitConfig = DEFAULT_CONFIG): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
};

export const getRateLimitKey = (identifier: string, prefix: string = 'default'): string => {
  return `${prefix}:${identifier}`;
};

export const createRateLimitMiddleware = (config: RateLimitConfig = DEFAULT_CONFIG) => {
  return (identifier: string) => {
    const result = checkRateLimit(identifier, config);
    return {
      ...result,
      isLimited: !result.allowed,
    };
  };
};

export const getAuthRateLimiter = () => createRateLimitMiddleware(AUTH_CONFIG);
export const getAPIRateLimiter = () => createRateLimitMiddleware(API_CONFIG);

// Cleanup old entries periodically (runs every 10 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}
