import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChangePasswordPage from '../../pages/ChangePasswordPage';
import * as authApi from '../../api/authApi';
import { ApiError } from '../../api/types';

jest.mock('../../api/authApi');
jest.mock('../../api/tokenStore', () => ({
  getAccessToken: jest.fn().mockReturnValue('test-token'),
}));

const mockChangePassword = authApi.changePassword as jest.MockedFunction<typeof authApi.changePassword>;

function renderPage() {
  return render(
    <MemoryRouter>
      <ChangePasswordPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ChangePasswordPage', () => {
  it('renders all three password fields and a submit button', () => {
    renderPage();

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('shows client-side validation errors when form is submitted empty', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your new password/i)).toBeInTheDocument();
    });

    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it('shows inline error when passwords do not match', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'OldPass1!' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewStr0ng!' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'Different1!' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    });

    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it('disables the submit button while loading', async () => {
    let resolve!: () => void;
    mockChangePassword.mockImplementationOnce(() => new Promise((res) => { resolve = res; }));

    renderPage();

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'OldPass1!' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewStr0ng!' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'NewStr0ng!' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });

    resolve();
  });

  it('displays success message and clears fields on 200 response', async () => {
    mockChangePassword.mockResolvedValueOnce(undefined);

    renderPage();

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'OldPass1!' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewStr0ng!' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'NewStr0ng!' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText(/your password has been changed successfully/i)).toBeInTheDocument();
    });

    expect((screen.getByLabelText(/current password/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('New Password') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/confirm new password/i) as HTMLInputElement).value).toBe('');
  });

  it('displays server field errors inline on 400 response', async () => {
    mockChangePassword.mockRejectedValueOnce(
      new ApiError(400, 'PASSWORD_VALIDATION_ERROR', 'Current password is incorrect', {
        currentPassword: 'Current password is incorrect',
      }),
    );

    renderPage();

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'WrongPass1!' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewStr0ng!' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'NewStr0ng!' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText(/current password is incorrect/i)).toBeInTheDocument();
    });

    expect((screen.getByLabelText(/current password/i) as HTMLInputElement).value).toBe('');
  });
});
