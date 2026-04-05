import { validatePasswordStrength, validateChangePasswordInput } from './authValidator';
import { ValidationError } from '../errors';

describe('validatePasswordStrength', () => {
  it('returns no errors for a valid strong password', () => {
    const errors = validatePasswordStrength('StrongP@ss1');
    expect(errors).toEqual({});
  });

  it('returns error when password is shorter than 8 characters', () => {
    const errors = validatePasswordStrength('Sh0rt!');
    expect(errors.newPassword).toMatch(/at least 8 characters/i);
  });

  it('returns error when password has no uppercase letter', () => {
    const errors = validatePasswordStrength('nouppercase1!');
    expect(errors.newPassword).toMatch(/uppercase/i);
  });

  it('returns error when password has no lowercase letter', () => {
    const errors = validatePasswordStrength('NOLOWERCASE1!');
    expect(errors.newPassword).toMatch(/lowercase/i);
  });

  it('returns error when password has no digit', () => {
    const errors = validatePasswordStrength('NoDigitHere!');
    expect(errors.newPassword).toMatch(/digit/i);
  });

  it('returns error when password has no special character', () => {
    const errors = validatePasswordStrength('NoSpecial1A');
    expect(errors.newPassword).toMatch(/special character/i);
  });

  it('uses custom fieldName in returned errors', () => {
    const errors = validatePasswordStrength('weak', 'confirmNewPassword');
    expect(errors.confirmNewPassword).toBeDefined();
    expect(errors.newPassword).toBeUndefined();
  });
});

describe('validateChangePasswordInput', () => {
  it('returns parsed data for valid input', () => {
    const result = validateChangePasswordInput({
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
      confirmNewPassword: 'NewPass1!',
    });
    expect(result.currentPassword).toBe('OldPass1!');
    expect(result.newPassword).toBe('NewPass1!');
    expect(result.confirmNewPassword).toBe('NewPass1!');
  });

  it('throws ValidationError when currentPassword is missing', () => {
    expect(() =>
      validateChangePasswordInput({ newPassword: 'NewPass1!', confirmNewPassword: 'NewPass1!' }),
    ).toThrow(ValidationError);
  });

  it('throws ValidationError when newPassword is missing', () => {
    expect(() =>
      validateChangePasswordInput({ currentPassword: 'OldPass1!', confirmNewPassword: 'NewPass1!' }),
    ).toThrow(ValidationError);
  });

  it('throws ValidationError when confirmNewPassword is missing', () => {
    expect(() =>
      validateChangePasswordInput({ currentPassword: 'OldPass1!', newPassword: 'NewPass1!' }),
    ).toThrow(ValidationError);
  });

  it('throws ValidationError with fieldErrors for empty body', () => {
    try {
      validateChangePasswordInput({});
      fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      const ve = err as ValidationError;
      expect(ve.fieldErrors.currentPassword).toBeDefined();
      expect(ve.fieldErrors.newPassword).toBeDefined();
      expect(ve.fieldErrors.confirmNewPassword).toBeDefined();
    }
  });
});
