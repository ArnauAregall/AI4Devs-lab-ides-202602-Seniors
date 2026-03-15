import { z } from 'zod';
import { ValidationError } from '../errors';

const educationSchema = z.object({
  degree: z.string().optional(),
  institution: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const workExperienceSchema = z.object({
  company: z.string().optional(),
  title: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().max(2000).optional(),
});

const createCandidateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  phone: z.string().max(50).optional(),
  address: z.string().max(255).optional(),
  source: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  education: z.array(educationSchema).optional(),
  workExperience: z.array(workExperienceSchema).optional(),
});

export type CreateCandidateInput = z.input<typeof createCandidateSchema>;
export type ValidatedCreateCandidateInput = z.output<typeof createCandidateSchema>;

export function validateCreateCandidateInput(raw: unknown): ValidatedCreateCandidateInput {
  const result = createCandidateSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join('.');
      if (field) {
        fieldErrors[field] = issue.message;
      }
    }
    throw new ValidationError('Validation failed', fieldErrors);
  }
  return result.data;
}
