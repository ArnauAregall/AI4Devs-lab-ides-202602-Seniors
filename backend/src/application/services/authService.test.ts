import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthService } from './authService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/models/User';
import { UnauthorizedError } from '../errors';

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
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
