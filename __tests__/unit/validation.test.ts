import { describe, it, expect } from 'vitest'
import { validateUUID, validateEmail, validatePassword } from '@/lib/validation'

describe('Validation Utilities', () => {
  describe('validateUUID', () => {
    it('should validate correct UUID format', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000'
      expect(validateUUID(validUUID)).toBe(true)
    })

    it('should reject invalid UUID format', () => {
      expect(validateUUID('not-a-uuid')).toBe(false)
      expect(validateUUID('550e8400-e29b-41d4-a716')).toBe(false)
      expect(validateUUID('')).toBe(false)
    })

    it('should handle UUID case insensitively', () => {
      const upperUUID = '550E8400-E29B-41D4-A716-446655440000'
      expect(validateUUID(upperUUID)).toBe(true)
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('john.doe+tag@company.co.uk')).toBe(true)
      expect(validateEmail('support@neurodiversity.africa')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid.email')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('SecurePassword123!')).toBe(true)
      expect(validatePassword('MyP@ssw0rd')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false)
      expect(validatePassword('12345678')).toBe(false)
      expect(validatePassword('NoSpecialChar1')).toBe(false)
    })

    it('should require minimum length', () => {
      expect(validatePassword('Short1!')).toBe(false) // too short
    })
  })
})
