import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../application/errors';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = payload;
    next();
  } catch {
    next(new AppError('UNAUTHORIZED', 'Invalid or expired token', 401));
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError('FORBIDDEN', 'Insufficient permissions', 403));
      return;
    }
    next();
  };
}
