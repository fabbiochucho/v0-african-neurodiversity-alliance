export interface ValidationResult {
  success: boolean;
  errors?: Record<string, string>;
}

// UUID validation (RFC 4122)
export const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Text validation
export const validateText = (text: string, minLength = 1, maxLength = 500): boolean => {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

// Rating validation (1-5)
export const validateRating = (rating: any): boolean => {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
};

// IEP data validation
export const validateIEPData = (data: {
  learner_id?: string;
  title?: string;
  description?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.learner_id) {
    errors.learner_id = 'Learner ID is required';
  } else if (!validateUUID(data.learner_id)) {
    errors.learner_id = 'Invalid learner ID format';
  }

  if (!data.title || !validateText(data.title, 3, 200)) {
    errors.title = 'Title must be 3-200 characters';
  }

  if (data.description && !validateText(data.description, 0, 2000)) {
    errors.description = 'Description must be 0-2000 characters';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
};

// Progress log validation
export const validateProgressLog = (data: {
  goal_id?: string;
  rating?: number;
  notes?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.goal_id || !validateUUID(data.goal_id)) {
    errors.goal_id = 'Valid goal ID is required';
  }

  if (!validateRating(data.rating)) {
    errors.rating = 'Rating must be between 1 and 5';
  }

  if (data.notes && !validateText(data.notes, 0, 1000)) {
    errors.notes = 'Notes must be 0-1000 characters';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
};

// Sanitize text input (prevent XSS)
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

// Validate password strength
export const validatePassword = (password: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    errors.uppercase = 'Password must contain an uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    errors.lowercase = 'Password must contain a lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    errors.number = 'Password must contain a number';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
};

// Validate learner profile data
export const validateLearnerData = (data: {
  name?: string;
  age?: number;
  gender?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name || !validateText(data.name, 2, 100)) {
    errors.name = 'Name must be 2-100 characters';
  }

  if (data.age !== undefined) {
    if (!Number.isInteger(data.age) || data.age < 0 || data.age > 120) {
      errors.age = 'Age must be between 0 and 120';
    }
  }

  if (data.gender && !['male', 'female', 'non-binary', 'prefer-not-to-say'].includes(data.gender.toLowerCase())) {
    errors.gender = 'Invalid gender value';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
};
