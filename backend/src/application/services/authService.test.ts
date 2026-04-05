import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthService } from './authService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/models/User';
import { UnauthorizedError, PasswordValidationError } from '../errors';

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  updatePassword: jest.fn(),
};

const service = new AuthService(mockUserRepo);

const hashedPassword = bcrypt.hashSync('secret123', 12);

const recruiterUser = new User({
  id: 1,
  email: 'recruiter@example.com',
  hashedPassword,
  role: 'recruiter',
});

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret-for-unit-tests';
});

describe('AuthService.login', () => {
  it('returns access token and refresh token for valid credentials', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(recruiterUser);

    const { accessToken, refreshToken } = await service.login(
      'recruiter@example.com',
      'secret123',
    );

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    const decoded = jwt.verify(accessToken, 'test-secret-for-unit-tests') as Record<string, unknown>;
    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('recruiter@example.com');
    expect(decoded.role).toBe('recruiter');
  });

  it('throws UnauthorizedError for wrong password', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(recruiterUser);

    await expect(
      service.login('recruiter@example.com', 'wrongpassword'),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws UnauthorizedError for unknown email', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      service.login('unknown@example.com', 'secret123'),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('returns same generic error for unknown email and wrong password', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    const error1 = await service.login('unknown@example.com', 'pass').catch((e) => e);

    mockUserRepo.findByEmail.mockResolvedValue(recruiterUser);
    const error2 = await service.login('recruiter@example.com', 'wrongpass').catch((e) => e);

    expect(error1.message).toBe(error2.message);
  });
});

describe('AuthService.changePassword', () => {
  it('hashes and updates password for valid current password and strong new password', async () => {
    mockUserRepo.findById.mockResolvedValue(recruiterUser);
    mockUserRepo.updatePassword.mockResolvedValue(undefined);

    await service.changePassword(1, 'secret123', 'NewStr0ng!');

    expect(mockUserRepo.updatePassword).toHaveBeenCalledWith(1, expect.any(String));
    const [, hashed] = mockUserRepo.updatePassword.mock.calls[0];
    expect(await bcrypt.compare('NewStr0ng!', hashed)).toBe(true);
  });

  it('throws PasswordValidationError when current password is incorrect', async () => {
    mockUserRepo.findById.mockResolvedValue(recruiterUser);

    await expect(
      service.changePassword(1, 'wrongpass', 'NewStr0ng!'),
    ).rejects.toBeInstanceOf(PasswordValidationError);
  });

  it('throws PasswordValidationError with currentPassword field for wrong current password', async () => {
    mockUserRepo.findById.mockResolvedValue(recruiterUser);

    const err = await service.changePassword(1, 'wrongpass', 'NewStr0ng!').catch((e) => e);
    expect(err.fieldErrors.currentPassword).toBeDefined();
  });

  it('throws PasswordValidationError when new password is too short', async () => {
    mockUserRepo.findById.mockResolvedValue(recruiterUser);

    await expect(
      service.changePassword(1, 'secret123', 'Sh0!'),
    ).rejects.toBeInstanceOf(PasswordValidationError);
  });

  it('throws PasswordValidationError when new password has no uppercase', async () => {
    mockUserRepo.findById.mockResolvedValue(recruiterUser);

    await expect(
      service.changePassword(1, 'secret123', 'nouppercase1!'),
    ).rejects.toBeInstanceOf(PasswordValidationError);
  });

  it('throws PasswordValidationError when new password has no lowercase', async () => {
    mockUserRepo.findById.mockResolvedValue(recruiterUser);

    await expect(
      service.changePassword(1, 'secret123', 'NOLOWER1!'),
    ).rejects.toBeInstanceOf(PasswordValidationError);
  });

  it('throws PasswordValidationError when new password has no digit', async () => {
    mockUserRepo.findById.mockResolvedValue(recruiterUser);

    await expect(
      service.changePassword(1, 'secret123', 'NoDigitHere!'),
    ).rejects.toBeInstanceOf(PasswordValidationError);
  });

  it('throws PasswordValidationError when new password has no special character', async () => {
    mockUserRepo.findById.mockResolvedValue(recruiterUser);

    await expect(
      service.changePassword(1, 'secret123', 'NoSpecial1A'),
    ).rejects.toBeInstanceOf(PasswordValidationError);
  });

  it('throws UnauthorizedError when user is not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      service.changePassword(99, 'secret123', 'NewStr0ng!'),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('does not call updatePassword when current password is incorrect', async () => {
    mockUserRepo.findById.mockResolvedValue(recruiterUser);

    await service.changePassword(1, 'wrongpass', 'NewStr0ng!').catch(() => undefined);

    expect(mockUserRepo.updatePassword).not.toHaveBeenCalled();
  });
});

describe('AuthService.refreshAccessToken', () => {
  it('returns a new access token for a valid refresh token', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(recruiterUser);
    const { refreshToken } = await service.login('recruiter@example.com', 'secret123');

    const newToken = service.refreshAccessToken(refreshToken);
    const decoded = jwt.verify(newToken, 'test-secret-for-unit-tests') as Record<string, unknown>;

    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('recruiter@example.com');
  });

  it('throws UnauthorizedError for an expired refresh token', () => {
    const expiredToken = jwt.sign(
      { userId: 1, email: 'x@x.com', role: 'recruiter' },
      'test-secret-for-unit-tests',
      { expiresIn: -1 },
    );

    expect(() => service.refreshAccessToken(expiredToken)).toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError for a tampered refresh token', () => {
    expect(() => service.refreshAccessToken('tampered.token.value')).toThrow(UnauthorizedError);
  });
});
