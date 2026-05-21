import { describe, it, expect } from 'vitest'
import { APIError, errorHandler } from '@/lib/error-handler'

describe('Error Handling', () => {
  describe('APIError', () => {
    it('should create error with correct properties', () => {
      const error = new APIError(400, 'INVALID_INPUT', 'Input validation failed')
      
      expect(error.status).toBe(400)
      expect(error.code).toBe('INVALID_INPUT')
      expect(error.message).toBe('Input validation failed')
    })

    it('should set 500 as default status', () => {
      const error = new APIError()
      expect(error.status).toBe(500)
    })

    it('should be instanceof Error', () => {
      const error = new APIError(400, 'TEST')
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('Error Status Codes', () => {
    it('should handle common HTTP status codes', () => {
      expect(new APIError(400, 'BAD_REQUEST').status).toBe(400)
      expect(new APIError(401, 'UNAUTHORIZED').status).toBe(401)
      expect(new APIError(403, 'FORBIDDEN').status).toBe(403)
      expect(new APIError(404, 'NOT_FOUND').status).toBe(404)
      expect(new APIError(429, 'RATE_LIMITED').status).toBe(429)
      expect(new APIError(500, 'SERVER_ERROR').status).toBe(500)
    })
  })

  describe('Error Recovery', () => {
    it('should gracefully handle undefined errors', () => {
      const error = APIError.fromUnknown(undefined)
      expect(error.status).toBeGreaterThanOrEqual(400)
    })

    it('should convert Error objects to APIError', () => {
      const stdError = new Error('Test error')
      const apiError = APIError.fromUnknown(stdError)
      expect(apiError instanceof APIError).toBe(true)
    })
  })
})
