import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/authService';
import { validateLoginInput } from '../../application/validators/authValidator';
import { UnauthorizedError } from '../../application/errors';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/api/v1/auth',
    maxAge: REFRESH_TOKEN_MAX_AGE * 1000,
  };
}

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = validateLoginInput(req.body);
      const { accessToken, refreshToken } = await this.authService.login(email, password);

      res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());

      res.status(200).json({
        success: true,
        data: { accessToken, expiresIn: 900 },
      });
    } catch (err) {
      next(err);
    }
  };

  refresh = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token: string | undefined = req.cookies?.[REFRESH_COOKIE];
      if (!token) {
        throw new UnauthorizedError('Refresh token missing');
      }

      const accessToken = this.authService.refreshAccessToken(token);

      res.status(200).json({
        success: true,
        data: { accessToken, expiresIn: 900 },
      });
    } catch (err) {
      next(err);
    }
  };

  logout = (_req: Request, res: Response, _next: NextFunction): void => {
    res.cookie(REFRESH_COOKIE, '', {
      ...refreshCookieOptions(),
      maxAge: 0,
    });
    res.status(204).send();
  };
}
