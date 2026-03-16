import { z } from 'zod';

// UUID validation
export const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Text length validation
export const validateText = (text: string, minLength = 1, maxLength = 500): boolean => {
  return text.length >= minLength && text.length <= maxLength;
};

// Rating validation (1-5)
export const validateRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

// IEP data validation
export const validateIEPData = (data: any) => {
  try {
    const schema = z.object({
      learner_id: z.string().uuid('Invalid learner ID format'),
      title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
      description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
    });

    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: { general: ['Validation error'] },
    };
  }
};

// Progress log validation
export const validateProgressLog = (data: any) => {
  try {
    const schema = z.object({
      goal_id: z.string().uuid('Invalid goal ID format'),
      rating: z.number().int().min(1).max(5),
      notes: z.string().max(1000).optional(),
    });

    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: { general: ['Validation error'] },
    };
  }
};

// Learner profile validation
export const validateLearnerProfile = (data: any) => {
  try {
    const schema = z.object({
      name: z.string().min(2).max(100),
      age: z.number().int().min(0).max(120).optional(),
      gender: z.string().max(50).optional(),
      country: z.string().max(100).optional(),
      diagnosis_domains: z.array(z.string()).optional(),
    });

    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: { general: ['Validation error'] },
    };
  }
};

// Auth validation
export const validateAuthData = (data: any) => {
  try {
    const schema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    });

    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        errors: result.error.flatten().fieldErrors,
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: { general: ['Validation error'] },
    };
  }
};

// Sanitize text to prevent XSS
export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Validate and sanitize input
export const validateAndSanitize = (input: string, maxLength = 500): { valid: boolean; value?: string } => {
  if (!input || typeof input !== 'string') {
    return { valid: false };
  }

  if (input.length > maxLength) {
    return { valid: false };
  }

  const sanitized = sanitizeText(input);
  return { valid: true, value: sanitized };
};
