import { validateChangePasswordForm } from '../../validation/changePasswordValidation';

const validInput = {
  currentPassword: 'OldPass1!',
  newPassword: 'NewStr0ng!',
  confirmNewPassword: 'NewStr0ng!',
};

describe('validateChangePasswordForm', () => {
  it('returns no errors for valid input', () => {
    const errors = validateChangePasswordForm(
      validInput.currentPassword,
      validInput.newPassword,
      validInput.confirmNewPassword,
    );
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('returns error for empty currentPassword', () => {
    const errors = validateChangePasswordForm('', validInput.newPassword, validInput.confirmNewPassword);
    expect(errors.currentPassword).toBeDefined();
  });

  it('returns error for empty newPassword', () => {
    const errors = validateChangePasswordForm(validInput.currentPassword, '', validInput.confirmNewPassword);
    expect(errors.newPassword).toBeDefined();
  });

  it('returns error for empty confirmNewPassword', () => {
    const errors = validateChangePasswordForm(validInput.currentPassword, validInput.newPassword, '');
    expect(errors.confirmNewPassword).toBeDefined();
  });

  it('returns newPassword error when new password is too short', () => {
    const errors = validateChangePasswordForm(validInput.currentPassword, 'Sh0!', validInput.confirmNewPassword);
    expect(errors.newPassword).toMatch(/at least 8 characters/i);
  });

  it('returns newPassword error when new password has no uppercase', () => {
    const errors = validateChangePasswordForm(validInput.currentPassword, 'nouppercase1!', 'nouppercase1!');
    expect(errors.newPassword).toMatch(/uppercase/i);
  });

  it('returns newPassword error when new password has no lowercase', () => {
    const errors = validateChangePasswordForm(validInput.currentPassword, 'NOLOWER1!', 'NOLOWER1!');
    expect(errors.newPassword).toMatch(/lowercase/i);
  });

  it('returns newPassword error when new password has no digit', () => {
    const errors = validateChangePasswordForm(validInput.currentPassword, 'NoDigitHere!', 'NoDigitHere!');
    expect(errors.newPassword).toMatch(/digit/i);
  });

  it('returns newPassword error when new password has no special character', () => {
    const errors = validateChangePasswordForm(validInput.currentPassword, 'NoSpecial1A', 'NoSpecial1A');
    expect(errors.newPassword).toMatch(/special character/i);
  });

  it('returns confirmNewPassword error when passwords do not match', () => {
    const errors = validateChangePasswordForm(
      validInput.currentPassword,
      'NewStr0ng!',
      'Different1!',
    );
    expect(errors.confirmNewPassword).toMatch(/do not match/i);
  });

  it('returns all three field errors when all fields are empty', () => {
    const errors = validateChangePasswordForm('', '', '');
    expect(errors.currentPassword).toBeDefined();
    expect(errors.newPassword).toBeDefined();
    expect(errors.confirmNewPassword).toBeDefined();
  });
});
