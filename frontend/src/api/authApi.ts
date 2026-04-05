import { ApiError, ApiErrorBody } from './types';
import { getAccessToken } from './tokenStore';

const BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3010';

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

async function parseErrorResponse(res: Response): Promise<never> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // ignore parse errors
  }
  throw new ApiError(
    res.status,
    body?.error?.code ?? 'UNKNOWN_ERROR',
    body?.error?.message ?? `Request failed with status ${res.status}`,
    body?.error?.fieldErrors,
  );
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return parseErrorResponse(res);
  }

  const json = (await res.json()) as { success: true; data: LoginResponse };
  return json.data;
}

export async function refreshToken(): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    return parseErrorResponse(res);
  }

  const json = (await res.json()) as { success: true; data: LoginResponse };
  return json.data;
}

export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}/api/v1/auth/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  });

  if (!res.ok) {
    return parseErrorResponse(res);
  }
}
