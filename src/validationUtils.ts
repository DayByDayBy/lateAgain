// Shared validation utilities for the Late Again app
// Provides consistent validation and sanitization across all components

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationOptions {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  customValidator?: (value: string) => ValidationResult;
}

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.trim().replace(/\s+/g, ' '); // Normalize whitespace
};

export const sanitizeEmail = (email: string): string => {
  return sanitizeInput(email).toLowerCase();
};

export const sanitizeText = (text: string): string => {
  return sanitizeInput(text);
};

// Validation functions
export const validateRequired = (value: string, fieldName: string = 'Field'): ValidationResult => {
  const sanitized = sanitizeInput(value);
  if (!sanitized) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  const sanitized = sanitizeEmail(email);
  if (!sanitized) {
    return { isValid: false, error: 'Email is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  const sanitized = sanitizeInput(password);
  if (!sanitized) {
    return { isValid: false, error: 'Password is required.' };
  }

  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(sanitized);
  const hasLowerCase = /[a-z]/.test(sanitized);
  const hasNumbers = /\d/.test(sanitized);

  if (sanitized.length < minLength) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { isValid: false, error: 'Password must include uppercase, lowercase, and a number.' };
  }

  return { isValid: true };
};

export const validateLength = (
  value: string,
  options: { min?: number; max?: number; fieldName?: string }
): ValidationResult => {
  const { min = 0, max = Infinity, fieldName = 'Field' } = options;
  const sanitized = sanitizeInput(value);

  if (sanitized.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters.` };
  }
  if (sanitized.length > max) {
    return { isValid: false, error: `${fieldName} must be no more than ${max} characters.` };
  }

  return { isValid: true };
};

export const validatePattern = (
  value: string,
  pattern: RegExp,
  errorMessage: string
): ValidationResult => {
  const sanitized = sanitizeInput(value);
  if (!pattern.test(sanitized)) {
    return { isValid: false, error: errorMessage };
  }
  return { isValid: true };
};

// Security-focused validation
export const validateNoSQLInjection = (value: string): ValidationResult => {
  const dangerousPatterns = [
    /(\$|\{|\}|\[|\]|\(|\)|;|'|"|`|\\|\/|\*|\+|\?|\^|\$|\||\.|\-)/,
  ];

  const sanitized = sanitizeInput(value);
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      return { isValid: false, error: 'Input contains invalid characters.' };
    }
  }

  return { isValid: true };
};

export const validateNoXSS = (value: string): ValidationResult => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  ];

  const sanitized = sanitizeInput(value);
  for (const pattern of xssPatterns) {
    if (pattern.test(sanitized)) {
      return { isValid: false, error: 'Input contains potentially unsafe content.' };
    }
  }

  return { isValid: true };
};

// Combined validation for forms
export const validateField = (
  value: string,
  options: ValidationOptions,
  fieldName: string = 'Field'
): ValidationResult => {
  const { required = true, minLength, maxLength, pattern, customValidator } = options;

  // Check required
  if (required) {
    const requiredResult = validateRequired(value, fieldName);
    if (!requiredResult.isValid) return requiredResult;
  }

  // Skip other validations if empty and not required
  const sanitized = sanitizeInput(value);
  if (!sanitized && !required) return { isValid: true };

  // Check length
  if (minLength !== undefined || maxLength !== undefined) {
    const lengthResult = validateLength(sanitized, { min: minLength, max: maxLength, fieldName });
    if (!lengthResult.isValid) return lengthResult;
  }

  // Check pattern
  if (pattern) {
    const patternResult = validatePattern(sanitized, pattern, `${fieldName} format is invalid.`);
    if (!patternResult.isValid) return patternResult;
  }

  // Security checks
  const sqlResult = validateNoSQLInjection(sanitized);
  if (!sqlResult.isValid) return sqlResult;

  const xssResult = validateNoXSS(sanitized);
  if (!xssResult.isValid) return xssResult;

  // Custom validation
  if (customValidator) {
    const customResult = customValidator(sanitized);
    if (!customResult.isValid) return customResult;
  }

  return { isValid: true };
};

// Predefined validation schemas
export const validationSchemas = {
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  transportType: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  issueDescription: {
    required: true,
    minLength: 10,
    maxLength: 500,
  },
  password: {
    required: true,
    minLength: 8,
    customValidator: (value: string) => validatePassword(value),
  },
};