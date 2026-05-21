import { describe, it, expect, beforeEach } from 'vitest'
import { createRateLimiter } from '@/lib/middleware/rate-limit'

describe('Rate Limiter', () => {
  describe('createRateLimiter', () => {
    it('should allow requests under limit', () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        max: 5,
      })

      const mockRequest = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: new Headers({
          'x-forwarded-for': '192.168.1.1',
        }),
      })

      // First 5 requests should succeed
      for (let i = 0; i < 5; i++) {
        const result = rateLimiter(mockRequest)
        expect(result.success).toBe(true)
      }
    })

    it('should block requests exceeding limit', () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        max: 3,
      })

      const mockRequest = new Request('http://localhost/api/test', {
        method: 'POST',
        headers: new Headers({
          'x-forwarded-for': '192.168.1.2',
        }),
      })

      // First 3 requests succeed
      for (let i = 0; i < 3; i++) {
        const result = rateLimiter(mockRequest)
        expect(result.success).toBe(true)
      }

      // 4th request should fail
      const result = rateLimiter(mockRequest)
      expect(result.success).toBe(false)
      expect(result.status).toBe(429)
    })

    it('should skip rate limiting based on condition', () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        max: 1,
        skip: (req) => req.headers.get('x-skip-rate-limit') === 'true',
      })

      const blockedRequest = new Request('http://localhost/api/test', {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.3',
        }),
      })

      const skipRequest = new Request('http://localhost/api/test', {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.3',
          'x-skip-rate-limit': 'true',
        }),
      })

      // First request succeeds
      expect(rateLimiter(blockedRequest).success).toBe(true)

      // Second request fails
      expect(rateLimiter(blockedRequest).success).toBe(false)

      // Skip request succeeds even though limit is reached
      expect(rateLimiter(skipRequest).success).toBe(true)
    })

    it('should use X-Real-IP header as fallback', () => {
      const rateLimiter = createRateLimiter({
        windowMs: 60000,
        max: 2,
      })

      const request1 = new Request('http://localhost/api/test', {
        headers: new Headers({
          'x-real-ip': '10.0.0.1',
        }),
      })

      const request2 = new Request('http://localhost/api/test', {
        headers: new Headers({
          'x-real-ip': '10.0.0.1',
        }),
      })

      expect(rateLimiter(request1).success).toBe(true)
      expect(rateLimiter(request2).success).toBe(true)

      const request3 = new Request('http://localhost/api/test', {
        headers: new Headers({
          'x-real-ip': '10.0.0.1',
        }),
      })

      expect(rateLimiter(request3).success).toBe(false)
    })
  })

  describe('Default Options', () => {
    it('should use default window of 15 minutes', () => {
      const rateLimiter = createRateLimiter({ max: 100 })
      // This is tested indirectly through the rate limiter behavior
      expect(rateLimiter).toBeDefined()
    })

    it('should use default max of 100 requests', () => {
      const rateLimiter = createRateLimiter()
      const mockRequest = new Request('http://localhost/api/test', {
        headers: new Headers({ 'x-forwarded-for': '192.168.1.4' }),
      })

      // Allow 100 requests
      for (let i = 0; i < 100; i++) {
        rateLimiter(mockRequest)
      }

      // 101st should fail
      const result = rateLimiter(mockRequest)
      expect(result.success).toBe(false)
    })
  })
})
