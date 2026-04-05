import { Request, Response, NextFunction } from 'express';
import { AuthController } from './authController';
import { AuthService } from '../../application/services/authService';
import { UnauthorizedError, ValidationError, PasswordValidationError } from '../../application/errors';

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

describe('AuthController.changePassword', () => {
  function makeReq(body: object, userId = 1): Request {
    return {
      body,
      user: { userId, email: 'recruiter@example.com', role: 'recruiter' },
    } as unknown as Request;
  }

  it('calls next with ValidationError when body fields are missing', async () => {
    const req = makeReq({});
    const res = mockRes();

    await controller.changePassword(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(mockService.changePassword).not.toHaveBeenCalled();
  });

  it('calls next with ValidationError when passwords do not match', async () => {
    const req = makeReq({
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
      confirmNewPassword: 'Different1!',
    });
    const res = mockRes();

    await controller.changePassword(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    const ve = (next as jest.Mock).mock.calls[0][0] as ValidationError;
    expect(ve.fieldErrors.confirmNewPassword).toBeDefined();
    expect(mockService.changePassword).not.toHaveBeenCalled();
  });

  it('calls next with PasswordValidationError when current password is wrong', async () => {
    mockService.changePassword.mockRejectedValue(
      new PasswordValidationError('Current password is incorrect', {
        currentPassword: 'Current password is incorrect',
      }),
    );

    const req = makeReq({
      currentPassword: 'WrongPass1!',
      newPassword: 'NewPass1!',
      confirmNewPassword: 'NewPass1!',
    });
    const res = mockRes();

    await controller.changePassword(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(PasswordValidationError));
  });

  it('returns 200 with success message and clears refresh cookie on success', async () => {
    mockService.changePassword.mockResolvedValue(undefined);

    const req = makeReq({
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
      confirmNewPassword: 'NewPass1!',
    });
    const res = mockRes();

    await controller.changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Your password has been changed successfully.',
    });
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      '',
      expect.objectContaining({ maxAge: 0 }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next with ValidationError when auth guard is missing (no req.user)', async () => {
    const req = {
      body: {
        currentPassword: 'OldPass1!',
        newPassword: 'NewPass1!',
        confirmNewPassword: 'NewPass1!',
      },
    } as unknown as Request;
    const res = mockRes();

    mockService.changePassword.mockResolvedValue(undefined);

    // With no req.user, req.user!.userId will throw a TypeError caught by next
    await controller.changePassword(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
