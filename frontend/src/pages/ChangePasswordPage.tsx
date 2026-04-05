import React, { useState, FormEvent } from 'react';
import { changePassword } from '../api/authApi';
import { validateChangePasswordForm, ChangePasswordFieldErrors } from '../validation/changePasswordValidation';
import { ApiError } from '../api/types';
import styles from './ChangePasswordPage.module.css';

interface FieldValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const emptyFields: FieldValues = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

export default function ChangePasswordPage() {
  const [fieldValues, setFieldValues] = useState<FieldValues>(emptyFields);
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(field: keyof FieldValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValues((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccessMessage('');

    const errors = validateChangePasswordForm(
      fieldValues.currentPassword,
      fieldValues.newPassword,
      fieldValues.confirmNewPassword,
    );

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      await changePassword(
        fieldValues.currentPassword,
        fieldValues.newPassword,
        fieldValues.confirmNewPassword,
      );

      setSuccessMessage('Your password has been changed successfully.');
      setFieldValues(emptyFields);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setFieldErrors({ currentPassword: 'An unexpected error occurred. Please try again.' });
      }
      setFieldValues(emptyFields);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>Change Password</h1>

        {successMessage && (
          <p className={styles.successMessage} role="status">
            {successMessage}
          </p>
        )}

        <div className={styles.field}>
          <label htmlFor="currentPassword" className={styles.label}>
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={fieldValues.currentPassword}
            onChange={handleChange('currentPassword')}
            className={styles.input}
            aria-describedby={fieldErrors.currentPassword ? 'currentPassword-error' : undefined}
            autoComplete="current-password"
          />
          {fieldErrors.currentPassword && (
            <span id="currentPassword-error" className={styles.fieldError} role="alert">
              {fieldErrors.currentPassword}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="newPassword" className={styles.label}>
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={fieldValues.newPassword}
            onChange={handleChange('newPassword')}
            className={styles.input}
            aria-describedby={fieldErrors.newPassword ? 'newPassword-error' : undefined}
            autoComplete="new-password"
          />
          {fieldErrors.newPassword && (
            <span id="newPassword-error" className={styles.fieldError} role="alert">
              {fieldErrors.newPassword}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmNewPassword" className={styles.label}>
            Confirm New Password
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            value={fieldValues.confirmNewPassword}
            onChange={handleChange('confirmNewPassword')}
            className={styles.input}
            aria-describedby={fieldErrors.confirmNewPassword ? 'confirmNewPassword-error' : undefined}
            autoComplete="new-password"
          />
          {fieldErrors.confirmNewPassword && (
            <span id="confirmNewPassword-error" className={styles.fieldError} role="alert">
              {fieldErrors.confirmNewPassword}
            </span>
          )}
        </div>

        <button type="submit" className={styles.submit} disabled={isLoading}>
          {isLoading ? 'Changing…' : 'Change Password'}
        </button>
      </form>
    </main>
  );
}
