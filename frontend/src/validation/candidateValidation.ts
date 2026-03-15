const ALLOWED_CV_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

export interface CandidateFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  source?: string;
  notes?: string;
  cvFile?: File | null;
}

export function validateCandidateForm(
  values: CandidateFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (values.cvFile) {
    if (!ALLOWED_CV_MIME_TYPES.includes(values.cvFile.type)) {
      errors.cvFile = 'Only PDF and DOCX files are accepted';
    } else if (values.cvFile.size > MAX_CV_SIZE_BYTES) {
      errors.cvFile = 'CV file must be 5 MB or smaller';
    }
  }

  return errors;
}
