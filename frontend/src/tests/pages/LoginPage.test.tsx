import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import { AuthProvider } from '../../auth/AuthContext';
import * as authApi from '../../api/authApi';
import { ApiError } from '../../api/types';

jest.mock('../../api/authApi');
jest.mock('../../api/candidatesApi', () => ({
  setAccessToken: jest.fn(),
}));

const mockLogin = authApi.login as jest.MockedFunction<typeof authApi.login>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginPage', () => {
  it('renders email and password fields and a submit button', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors when form is submitted empty', async () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('stores token and redirects to / on successful login', async () => {
    mockLogin.mockResolvedValueOnce({ accessToken: 'valid.token', expiresIn: 900 });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows server error message on 401 response', async () => {
    mockLogin.mockRejectedValueOnce(
      new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password'),
    );

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid email or password/i);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables the submit button while loading', async () => {
    let resolveLogin!: (value: { accessToken: string; expiresIn: number }) => void;
    mockLogin.mockImplementationOnce(
      () => new Promise((res) => { resolveLogin = res; }),
    );

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'u@u.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });

    resolveLogin({ accessToken: 'tok', expiresIn: 900 });
  });
});
