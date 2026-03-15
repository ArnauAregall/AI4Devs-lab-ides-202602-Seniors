import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from './auth';
import { AppError } from '../application/errors';

const TEST_SECRET = 'middleware-unit-test-secret';

beforeEach(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

function mockReq(authHeader?: string): Request {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  } as unknown as Request;
}

const res = {} as Response;

describe('authenticate middleware', () => {
  it('sets req.user and calls next for a valid Bearer token', () => {
    const token = jwt.sign(
      { userId: 1, email: 'r@example.com', role: 'recruiter' },
      TEST_SECRET,
      { expiresIn: 900 },
    );
    const next: NextFunction = jest.fn();
    const req = mockReq(`Bearer ${token}`);

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ userId: 1, email: 'r@example.com', role: 'recruiter' });
  });

  it('calls next with 401 AppError when Authorization header is missing', () => {
    const next: NextFunction = jest.fn();
    const req = mockReq();

    authenticate(req, res, next);

    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('calls next with 401 AppError when token is expired', () => {
    const expiredToken = jwt.sign(
      { userId: 1, email: 'r@example.com', role: 'recruiter' },
      TEST_SECRET,
      { expiresIn: -1 },
    );
    const next: NextFunction = jest.fn();
    const req = mockReq(`Bearer ${expiredToken}`);

    authenticate(req, res, next);

    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
  });

  it('calls next with 401 AppError when token signature is invalid', () => {
    const next: NextFunction = jest.fn();
    const req = mockReq('Bearer tampered.token.value');

    authenticate(req, res, next);

    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
  });
});
