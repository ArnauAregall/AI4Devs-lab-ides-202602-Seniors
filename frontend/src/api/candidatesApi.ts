import {
  ApiError,
  ApiErrorBody,
  ApiSuccessResponse,
  CandidateResponse,
  CreateCandidateRequest,
} from './types';

const BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3010';
const API_TOKEN = process.env.REACT_APP_API_TOKEN ?? '';

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

export async function createCandidate(
  request: CreateCandidateRequest,
): Promise<CandidateResponse> {
  const headers: HeadersInit = {
    Authorization: `Bearer ${API_TOKEN}`,
  };

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

  const res = await fetch(`${BASE_URL}/api/v1/candidates`, {
    method: 'POST',
    headers,
    body,
  });

  if (!res.ok) {
    return parseErrorResponse(res);
  }

  const json = (await res.json()) as ApiSuccessResponse<CandidateResponse>;
  return json.data;
}

export async function getCandidateById(id: number): Promise<CandidateResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/candidates/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });

  if (!res.ok) {
    return parseErrorResponse(res);
  }

  const json = (await res.json()) as ApiSuccessResponse<CandidateResponse>;
  return json.data;
}
