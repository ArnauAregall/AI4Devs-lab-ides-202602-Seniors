import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UnauthorizedError, PasswordValidationError } from '../errors';
import { validatePasswordStrength } from '../validators/authValidator';

const ACCESS_TOKEN_TTL = 15 * 60;
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

function getSecret(): string {
  return process.env.JWT_SECRET ?? 'change-me-in-production';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  userId: number;
  email: string;
  role: string;
}

export class AuthService {
  constructor(private readonly userRepo: IUserRepository) {}

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.userRepo.findByEmail(email);

    const isValid =
      user !== null && (await bcrypt.compare(password, user.hashedPassword));

    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload: AccessTokenPayload = {
      userId: user!.id!,
      email: user!.email,
      role: user!.role,
    };

    const accessToken = jwt.sign(payload, getSecret(), {
      algorithm: 'HS256',
      expiresIn: ACCESS_TOKEN_TTL,
    });

    const refreshToken = jwt.sign(
      { userId: user!.id!, email: user!.email, role: user!.role },
      getSecret(),
      { algorithm: 'HS256', expiresIn: REFRESH_TOKEN_TTL },
    );

    return { accessToken, refreshToken };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isCurrentValid) {
      throw new PasswordValidationError('Current password is incorrect', {
        currentPassword: 'Current password is incorrect',
      });
    }

    const strengthErrors = validatePasswordStrength(newPassword);
    if (Object.keys(strengthErrors).length > 0) {
      throw new PasswordValidationError('New password does not meet strength requirements', strengthErrors);
    }

    const hashedNew = await bcrypt.hash(newPassword, 12);
    await this.userRepo.updatePassword(userId, hashedNew);
  }

  refreshAccessToken(refreshToken: string): string {
    let payload: AccessTokenPayload;
    try {
      payload = jwt.verify(refreshToken, getSecret()) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    return jwt.sign(
      { userId: payload.userId, email: payload.email, role: payload.role },
      getSecret(),
      { algorithm: 'HS256', expiresIn: ACCESS_TOKEN_TTL },
    );
  }
}
