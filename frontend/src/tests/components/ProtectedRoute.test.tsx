import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { AuthProvider } from '../../auth/AuthContext';
import * as authApi from '../../api/authApi';
import * as candidatesApi from '../../api/candidatesApi';

jest.mock('../../api/authApi');
jest.mock('../../api/candidatesApi', () => ({
  setAccessToken: jest.fn(),
  getAccessToken: jest.fn(),
}));

const mockRefreshToken = authApi.refreshToken as jest.MockedFunction<typeof authApi.refreshToken>;
const mockSetAccessToken = candidatesApi.setAccessToken as jest.MockedFunction<typeof candidatesApi.setAccessToken>;

function renderWithRouter(initialPath: string, token?: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <p>Protected content</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => jest.clearAllMocks());

describe('ProtectedRoute', () => {
  it('redirects unauthenticated user to /login when refresh fails', async () => {
    mockRefreshToken.mockRejectedValueOnce(new Error('no cookie'));

    renderWithRouter('/');

    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument();
    });
  });

  it('renders children after successful silent refresh', async () => {
    mockRefreshToken.mockResolvedValueOnce({ accessToken: 'new.token', expiresIn: 900 });

    renderWithRouter('/');

    await waitFor(() => {
      expect(screen.getByText('Protected content')).toBeInTheDocument();
    });

    expect(mockSetAccessToken).toHaveBeenCalledWith('new.token');
  });
});
