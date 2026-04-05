export interface ChangePasswordFieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export function validateChangePasswordForm(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
): ChangePasswordFieldErrors {
  const errors: ChangePasswordFieldErrors = {};

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  if (!newPassword) {
    errors.newPassword = 'New password is required';
  } else if (newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters long';
  } else if (!/[A-Z]/.test(newPassword)) {
    errors.newPassword = 'Password must contain at least one uppercase letter';
  } else if (!/[a-z]/.test(newPassword)) {
    errors.newPassword = 'Password must contain at least one lowercase letter';
  } else if (!/[0-9]/.test(newPassword)) {
    errors.newPassword = 'Password must contain at least one digit';
  } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
    errors.newPassword = 'Password must contain at least one special character';
  }

  if (!confirmNewPassword) {
    errors.confirmNewPassword = 'Please confirm your new password';
  } else if (!errors.newPassword && newPassword !== confirmNewPassword) {
    errors.confirmNewPassword = 'Passwords do not match';
  }

  return errors;
}
