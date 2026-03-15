import { login, refreshToken, logout } from '../../api/authApi';
import { ApiError } from '../../api/types';

const BASE_URL = 'http://localhost:3010';

beforeEach(() => {
  jest.resetAllMocks();
  process.env.REACT_APP_API_URL = BASE_URL;
});

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

function makeJsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('authApi.login', () => {
  it('calls POST /api/v1/auth/login with credentials and returns accessToken', async () => {
    mockFetch.mockResolvedValueOnce(
      makeJsonResponse(200, { success: true, data: { accessToken: 'token.abc', expiresIn: 900 } }),
    );

    const result = await login('user@example.com', 'pass');

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/auth/login`,
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email: 'user@example.com', password: 'pass' }),
      }),
    );
    expect(result.accessToken).toBe('token.abc');
    expect(result.expiresIn).toBe(900);
  });

  it('throws ApiError on 401', async () => {
    mockFetch.mockResolvedValueOnce(
      makeJsonResponse(401, {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      }),
    );

    await expect(login('x@x.com', 'wrong')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('authApi.refreshToken', () => {
  it('calls POST /api/v1/auth/refresh with credentials: include', async () => {
    mockFetch.mockResolvedValueOnce(
      makeJsonResponse(200, { success: true, data: { accessToken: 'new.token', expiresIn: 900 } }),
    );

    const result = await refreshToken();

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/auth/refresh`,
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
    expect(result.accessToken).toBe('new.token');
  });

  it('throws ApiError on 401', async () => {
    mockFetch.mockResolvedValueOnce(makeJsonResponse(401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Expired' } }));

    await expect(refreshToken()).rejects.toBeInstanceOf(ApiError);
  });
});

describe('authApi.logout', () => {
  it('calls POST /api/v1/auth/logout with credentials: include', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: async () => null } as unknown as Response);

    await logout();

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/v1/auth/logout`,
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });
});
