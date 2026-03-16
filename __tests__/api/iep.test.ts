import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { validateUUID, validateEmail, validateRating, validateIEPData, validateProgressLog } from '@/lib/validation';
import { APIError, errorHandler } from '@/lib/error-handler';

describe('API Validation Tests', () => {
  describe('UUID Validation', () => {
    it('should validate correct UUID format', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(validateUUID(validUUID)).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      expect(validateUUID('not-a-uuid')).toBe(false);
      expect(validateUUID('550e8400-e29b-41d4-a716')).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('Rating Validation', () => {
    it('should validate correct rating (1-5)', () => {
      expect(validateRating(1)).toBe(true);
      expect(validateRating(3)).toBe(true);
      expect(validateRating(5)).toBe(true);
    });

    it('should reject invalid rating', () => {
      expect(validateRating(0)).toBe(false);
      expect(validateRating(6)).toBe(false);
      expect(validateRating(2.5)).toBe(false);
    });
  });

  describe('IEP Data Validation', () => {
    it('should validate correct IEP data', () => {
      const validData = {
        learner_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Math IEP',
        description: 'Focus on arithmetic skills',
      };
      const result = validateIEPData(validData);
      expect(result.success).toBe(true);
    });

    it('should reject IEP data with invalid learner_id', () => {
      const invalidData = {
        learner_id: 'invalid-uuid',
        title: 'Math IEP',
      };
      const result = validateIEPData(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject IEP data with short title', () => {
      const invalidData = {
        learner_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'AB',
      };
      const result = validateIEPData(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional description', () => {
      const validData = {
        learner_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Math IEP',
      };
      const result = validateIEPData(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Progress Log Validation', () => {
    it('should validate correct progress log', () => {
      const validData = {
        goal_id: '550e8400-e29b-41d4-a716-446655440000',
        rating: 4,
        notes: 'Good progress this week',
      };
      const result = validateProgressLog(validData);
      expect(result.success).toBe(true);
    });

    it('should reject progress log with invalid rating', () => {
      const invalidData = {
        goal_id: '550e8400-e29b-41d4-a716-446655440000',
        rating: 10,
      };
      const result = validateProgressLog(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional notes', () => {
      const validData = {
        goal_id: '550e8400-e29b-41d4-a716-446655440000',
        rating: 3,
      };
      const result = validateProgressLog(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Error Handler Tests', () => {
  it('should handle APIError correctly', () => {
    const error = new APIError(400, 'VALIDATION_ERROR', 'Invalid input');
    const { status, body } = errorHandler(error);

    expect(status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('VALIDATION_ERROR');
    expect(body.message).toBe('Invalid input');
  });

  it('should handle JSON parsing errors', () => {
    const error = new SyntaxError('Unexpected token');
    const { status, body } = errorHandler(error);

    expect(status).toBe(400);
    expect(body.error).toBe('INVALID_JSON');
  });

  it('should handle unknown errors as 500', () => {
    const error = new Error('Unknown error');
    const { status, body } = errorHandler(error);

    expect(status).toBe(500);
    expect(body.error).toBe('INTERNAL_SERVER_ERROR');
  });

  it('should include details in error response when provided', () => {
    const error = new APIError(400, 'VALIDATION_ERROR', 'Invalid input', {
      field: 'email',
      reason: 'Invalid format',
    });
    const { status, body } = errorHandler(error);

    expect(body.details).toBeDefined();
    expect(body.details.field).toBe('email');
  });
});
