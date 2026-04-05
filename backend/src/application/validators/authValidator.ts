import { z } from 'zod';
import { ValidationError } from '../errors';

const loginSchema = z.object({
  email: z.string({ required_error: 'email is required' }).email('Invalid email format'),
  password: z.string({ required_error: 'password is required' }).min(1, 'password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'currentPassword is required' }).min(1, 'currentPassword is required'),
  newPassword: z.string({ required_error: 'newPassword is required' }).min(1, 'newPassword is required'),
  confirmNewPassword: z.string({ required_error: 'confirmNewPassword is required' }).min(1, 'confirmNewPassword is required'),
});

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface PasswordStrengthErrors {
  [field: string]: string;
}

export function validatePasswordStrength(password: string, fieldName = 'newPassword'): PasswordStrengthErrors {
  const errors: PasswordStrengthErrors = {};

  if (password.length < 8) {
    errors[fieldName] = 'Password must be at least 8 characters long';
  } else if (!/[A-Z]/.test(password)) {
    errors[fieldName] = 'Password must contain at least one uppercase letter';
  } else if (!/[a-z]/.test(password)) {
    errors[fieldName] = 'Password must contain at least one lowercase letter';
  } else if (!/[0-9]/.test(password)) {
    errors[fieldName] = 'Password must contain at least one digit';
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errors[fieldName] = 'Password must contain at least one special character';
  }

  return errors;
}

export function validateLoginInput(body: unknown): LoginInput {
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fieldErrors[field] = issue.message;
    }
    throw new ValidationError('Validation failed', fieldErrors);
  }

  return result.data;
}

export function validateChangePasswordInput(body: unknown): ChangePasswordInput {
  const result = changePasswordSchema.safeParse(body);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (field) fieldErrors[field] = issue.message;
    }
    throw new ValidationError('Validation failed', fieldErrors);
  }

  return result.data;
}
