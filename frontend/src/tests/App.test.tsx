import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../auth/AuthContext';
import * as authApi from '../api/authApi';

jest.mock('../api/authApi');
const mockRefreshToken = authApi.refreshToken as jest.MockedFunction<typeof authApi.refreshToken>;

test('renders the dashboard when a valid session is available', async () => {
  mockRefreshToken.mockResolvedValueOnce({ accessToken: 'test-token', expiresIn: 900 });

  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
