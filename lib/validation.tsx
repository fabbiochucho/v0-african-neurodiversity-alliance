export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
  data?: any;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character (!@#$%^&*)');

  return { valid: errors.length === 0, errors };
};

export const validateLearnerProfile = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.name = 'Learner name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Learner name must be 100 characters or less';
  }

  if (data.age !== undefined) {
    if (typeof data.age !== 'number' || data.age < 0 || data.age > 120) {
      errors.age = 'Age must be a valid number between 0 and 120';
    }
  }

  if (data.gender && !['male', 'female', 'non-binary', 'prefer_not_to_say'].includes(data.gender)) {
    errors.gender = 'Invalid gender value';
  }

  if (!data.diagnosis_domains || !Array.isArray(data.diagnosis_domains)) {
    errors.diagnosis_domains = 'Diagnosis domains must be an array';
  } else if (data.diagnosis_domains.length === 0) {
    errors.diagnosis_domains = 'At least one diagnosis domain must be selected';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
    data: Object.keys(errors).length === 0 ? data : undefined,
  };
};

export const validateIEPData = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.learner_id || typeof data.learner_id !== 'string') {
    errors.learner_id = 'Learner ID is required';
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.title = 'IEP title is required';
  } else if (data.title.length > 200) {
    errors.title = 'IEP title must be 200 characters or less';
  }

  if (data.description && typeof data.description !== 'string') {
    errors.description = 'Description must be text';
  } else if (data.description && data.description.length > 2000) {
    errors.description = 'Description must be 2000 characters or less';
  }

  if (data.status && !['draft', 'active', 'completed', 'archived'].includes(data.status)) {
    errors.status = 'Invalid IEP status';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
    data: Object.keys(errors).length === 0 ? data : undefined,
  };
};

export const validateProgressLog = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.goal_id || typeof data.goal_id !== 'string') {
    errors.goal_id = 'Goal ID is required';
  }

  if (data.rating === undefined || typeof data.rating !== 'number') {
    errors.rating = 'Rating is required';
  } else if (data.rating < 1 || data.rating > 5 || !Number.isInteger(data.rating)) {
    errors.rating = 'Rating must be an integer between 1 and 5';
  }

  if (data.notes && typeof data.notes !== 'string') {
    errors.notes = 'Notes must be text';
  } else if (data.notes && data.notes.length > 1000) {
    errors.notes = 'Notes must be 1000 characters or less';
  }

  if (data.logged_date && isNaN(new Date(data.logged_date).getTime())) {
    errors.logged_date = 'Invalid date format';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
    data: Object.keys(errors).length === 0 ? data : undefined,
  };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
