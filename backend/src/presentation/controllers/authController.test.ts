import { Request, Response, NextFunction } from 'express';
import { AuthController } from './authController';
import { AuthService } from '../../application/services/authService';
import { UnauthorizedError, ValidationError } from '../../application/errors';

jest.mock('../../application/services/authService');

const mockService = new AuthService({} as never) as jest.Mocked<AuthService>;
const controller = new AuthController(mockService);

function mockRes(): Response {
  const cookies: Record<string, unknown> = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn((_name: string, _val: unknown, _opts: unknown) => {
      cookies[_name as string] = _val;
      return res;
    }),
    _cookies: cookies,
  } as unknown as Response;
  return res;
}

const next: NextFunction = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('AuthController.login', () => {
  it('returns 200 with accessToken and sets refresh cookie on success', async () => {
    mockService.login.mockResolvedValue({
      accessToken: 'access.token',
      refreshToken: 'refresh.token',
    });

    const req = {
      body: { email: 'recruiter@example.com', password: 'secret123' },
    } as unknown as Request;
    const res = mockRes();

    await controller.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { accessToken: 'access.token', expiresIn: 900 },
    });
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh.token',
      expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next with UnauthorizedError for invalid credentials', async () => {
    mockService.login.mockRejectedValue(new UnauthorizedError('Invalid email or password'));

    const req = {
      body: { email: 'x@x.com', password: 'wrong' },
    } as unknown as Request;
    const res = mockRes();

    await controller.login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('calls next with ValidationError for missing fields', async () => {
    const req = { body: {} } as Request;
    const res = mockRes();

    await controller.login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(mockService.login).not.toHaveBeenCalled();
  });

  it('calls next with ValidationError for invalid email format', async () => {
    const req = { body: { email: 'not-an-email', password: 'pass' } } as unknown as Request;
    const res = mockRes();

    await controller.login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
  });
});

describe('AuthController.refresh', () => {
  it('returns 200 with new accessToken for valid refresh cookie', () => {
    mockService.refreshAccessToken.mockReturnValue('new.access.token');

    const req = {
      cookies: { refreshToken: 'valid.refresh.token' },
    } as unknown as Request;
    const res = mockRes();

    controller.refresh(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { accessToken: 'new.access.token', expiresIn: 900 },
    });
  });

  it('calls next with UnauthorizedError when refresh cookie is missing', () => {
    const req = { cookies: {} } as unknown as Request;
    const res = mockRes();

    controller.refresh(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(mockService.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('calls next with UnauthorizedError for expired/tampered token', () => {
    mockService.refreshAccessToken.mockImplementation(() => {
      throw new UnauthorizedError('Invalid or expired refresh token');
    });

    const req = {
      cookies: { refreshToken: 'expired.token' },
    } as unknown as Request;
    const res = mockRes();

    controller.refresh(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});

describe('AuthController.logout', () => {
  it('returns 204 and clears the refresh cookie', () => {
    const req = {} as Request;
    const res = mockRes();

    controller.logout(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      '',
      expect.objectContaining({ maxAge: 0 }),
    );
  });
});
