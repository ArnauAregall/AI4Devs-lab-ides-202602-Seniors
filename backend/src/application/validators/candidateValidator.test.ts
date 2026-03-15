import { validateCreateCandidateInput, CreateCandidateInput } from './candidateValidator';
import { ValidationError } from '../errors';

const validInput: CreateCandidateInput = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
};

describe('candidateValidator - validateCreateCandidateInput', () => {
  describe('should_pass_when_valid_input_provided', () => {
    it('should return parsed data for minimal valid input', () => {
      const result = validateCreateCandidateInput(validInput);
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('jane.doe@example.com');
    });

    it('should return parsed data for full valid input', () => {
      const result = validateCreateCandidateInput({
        ...validInput,
        phone: '+34600000000',
        address: '123 Main St',
        source: 'LinkedIn',
        notes: 'Great candidate',
        education: [
          { degree: 'BSc', institution: 'MIT', startDate: '2018-09-01', endDate: '2022-06-01' },
        ],
        workExperience: [
          { company: 'Acme', title: 'Engineer', startDate: '2022-07-01', description: 'Built stuff' },
        ],
      });
      expect(result.phone).toBe('+34600000000');
      expect(result.education).toHaveLength(1);
      expect(result.workExperience).toHaveLength(1);
    });
  });

  describe('should_throw_ValidationError_when_required_fields_missing', () => {
    it('should fail when firstName is missing', () => {
      expect(() =>
        validateCreateCandidateInput({ ...validInput, firstName: '' })
      ).toThrow(ValidationError);
    });

    it('should fail when lastName is missing', () => {
      expect(() =>
        validateCreateCandidateInput({ ...validInput, lastName: '' })
      ).toThrow(ValidationError);
    });

    it('should fail when email is missing', () => {
      expect(() =>
        validateCreateCandidateInput({ ...validInput, email: '' })
      ).toThrow(ValidationError);
    });

    it('should include field-level errors for each invalid field', () => {
      try {
        validateCreateCandidateInput({ firstName: '', lastName: '', email: 'bad' });
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError);
        const ve = err as ValidationError;
        expect(ve.fieldErrors).toHaveProperty('firstName');
        expect(ve.fieldErrors).toHaveProperty('lastName');
        expect(ve.fieldErrors).toHaveProperty('email');
      }
    });
  });

  describe('should_throw_ValidationError_when_format_is_invalid', () => {
    it('should fail with invalid email format', () => {
      try {
        validateCreateCandidateInput({ ...validInput, email: 'not-an-email' });
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError);
        const ve = err as ValidationError;
        expect(ve.fieldErrors).toHaveProperty('email');
      }
    });

    it('should fail when firstName exceeds 100 characters', () => {
      expect(() =>
        validateCreateCandidateInput({ ...validInput, firstName: 'a'.repeat(101) })
      ).toThrow(ValidationError);
    });

    it('should fail when notes exceed 2000 characters', () => {
      expect(() =>
        validateCreateCandidateInput({ ...validInput, notes: 'x'.repeat(2001) })
      ).toThrow(ValidationError);
    });
  });
});
