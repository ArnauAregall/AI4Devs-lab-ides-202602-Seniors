import { validateCandidateForm } from '../../validation/candidateValidation';

const validBase = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
};

describe('validateCandidateForm', () => {
  it('returns no errors for valid required fields', () => {
    const errors = validateCandidateForm(validBase);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('returns error for missing firstName', () => {
    const errors = validateCandidateForm({ ...validBase, firstName: '' });
    expect(errors.firstName).toBeTruthy();
  });

  it('returns error for whitespace-only firstName', () => {
    const errors = validateCandidateForm({ ...validBase, firstName: '   ' });
    expect(errors.firstName).toBeTruthy();
  });

  it('returns error for missing lastName', () => {
    const errors = validateCandidateForm({ ...validBase, lastName: '' });
    expect(errors.lastName).toBeTruthy();
  });

  it('returns error for missing email', () => {
    const errors = validateCandidateForm({ ...validBase, email: '' });
    expect(errors.email).toBeTruthy();
  });

  it('returns error for invalid email format', () => {
    const errors = validateCandidateForm({ ...validBase, email: 'not-an-email' });
    expect(errors.email).toBeTruthy();
  });

  it('returns no error for a valid email address', () => {
    const errors = validateCandidateForm({ ...validBase, email: 'valid@domain.co.uk' });
    expect(errors.email).toBeUndefined();
  });

  it('returns no error when no CV file is provided', () => {
    const errors = validateCandidateForm({ ...validBase, cvFile: null });
    expect(errors.cvFile).toBeUndefined();
  });

  it('returns no error for a valid PDF CV file', () => {
    const file = new File(['content'], 'cv.pdf', { type: 'application/pdf' });
    const errors = validateCandidateForm({ ...validBase, cvFile: file });
    expect(errors.cvFile).toBeUndefined();
  });

  it('returns no error for a valid DOCX CV file', () => {
    const file = new File(['content'], 'cv.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const errors = validateCandidateForm({ ...validBase, cvFile: file });
    expect(errors.cvFile).toBeUndefined();
  });

  it('returns error for an unsupported file type', () => {
    const file = new File(['content'], 'cv.txt', { type: 'text/plain' });
    const errors = validateCandidateForm({ ...validBase, cvFile: file });
    expect(errors.cvFile).toBeTruthy();
  });

  it('returns error for a file exceeding 5 MB', () => {
    const largeContent = new Uint8Array(6 * 1024 * 1024);
    const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
    const errors = validateCandidateForm({ ...validBase, cvFile: file });
    expect(errors.cvFile).toBeTruthy();
  });

  it('returns errors for all missing required fields simultaneously', () => {
    const errors = validateCandidateForm({ firstName: '', lastName: '', email: '' });
    expect(errors.firstName).toBeTruthy();
    expect(errors.lastName).toBeTruthy();
    expect(errors.email).toBeTruthy();
  });
});
