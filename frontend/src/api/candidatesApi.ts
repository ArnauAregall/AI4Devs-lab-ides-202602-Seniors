import {
  ApiError,
  ApiErrorBody,
  ApiSuccessResponse,
  CandidateResponse,
  CreateCandidateRequest,
} from './types';
import { refreshToken as authRefreshToken } from './authApi';
import { getAccessToken, setAccessToken } from './tokenStore';

export { getAccessToken, setAccessToken };

const BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3010';

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

async function withRefreshRetry<T>(
  doRequest: (token: string | null) => Promise<Response>,
): Promise<T> {
  let res = await doRequest(getAccessToken());

  if (res.status === 401) {
    try {
      const refreshed = await authRefreshToken();
      setAccessToken(refreshed.accessToken);
      res = await doRequest(getAccessToken());
    } catch {
      throw new ApiError(401, 'UNAUTHORIZED', 'Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    return parseErrorResponse(res);
  }

  return (await res.json()) as T;
}

export async function createCandidate(
  request: CreateCandidateRequest,
): Promise<CandidateResponse> {
  const makeRequest = (token: string | null) => {
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let body: BodyInit;

    if (request.cvFile) {
      const form = new FormData();
      form.append('firstName', request.firstName);
      form.append('lastName', request.lastName);
      form.append('email', request.email);
      if (request.phone) form.append('phone', request.phone);
      if (request.address) form.append('address', request.address);
      if (request.source) form.append('source', request.source);
      if (request.notes) form.append('notes', request.notes);
      if (request.education) {
        form.append('education', JSON.stringify(request.education));
      }
      if (request.workExperience) {
        form.append('workExperience', JSON.stringify(request.workExperience));
      }
      form.append('cvFile', request.cvFile);
      body = form;
    } else {
      headers['Content-Type'] = 'application/json';
      const { cvFile: _cvFile, ...rest } = request;
      body = JSON.stringify(rest);
    }

    return fetch(`${BASE_URL}/api/v1/candidates`, {
      method: 'POST',
      headers,
      body,
    });
  };

  const json = await withRefreshRetry<ApiSuccessResponse<CandidateResponse>>(makeRequest);
  return json.data;
}

export async function getCandidateById(id: number): Promise<CandidateResponse> {
  const makeRequest = (token: string | null) =>
    fetch(`${BASE_URL}/api/v1/candidates/${id}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

  const json = await withRefreshRetry<ApiSuccessResponse<CandidateResponse>>(makeRequest);
  return json.data;
}
