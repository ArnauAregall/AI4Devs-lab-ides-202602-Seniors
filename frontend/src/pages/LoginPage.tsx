import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuth } from '../auth/AuthContext';
import { setAccessToken } from '../api/candidatesApi';
import { ApiError } from '../api/types';
import styles from './LoginPage.module.css';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAccessToken: storeToken } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const { accessToken } = await login(email, password);
      storeToken(accessToken);
      setAccessToken(accessToken);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError('Invalid email or password.');
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>Sign in</h1>

        {serverError && (
          <p className={styles.serverError} role="alert">
            {serverError}
          </p>
        )}

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            autoComplete="username"
          />
          {fieldErrors.email && (
            <span id="email-error" className={styles.fieldError} role="alert">
              {fieldErrors.email}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            autoComplete="current-password"
          />
          {fieldErrors.password && (
            <span id="password-error" className={styles.fieldError} role="alert">
              {fieldErrors.password}
            </span>
          )}
        </div>

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
