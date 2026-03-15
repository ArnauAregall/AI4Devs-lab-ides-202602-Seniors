import { z } from 'zod';
import { ValidationError } from '../errors';

const loginSchema = z.object({
  email: z.string({ required_error: 'email is required' }).email('Invalid email format'),
  password: z.string({ required_error: 'password is required' }).min(1, 'password is required'),
});

export interface LoginInput {
  email: string;
  password: string;
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
