import { createCandidate, getCandidateById, setAccessToken } from '../../api/candidatesApi';
import { ApiError } from '../../api/types';
import * as authApi from '../../api/authApi';

jest.mock('../../api/authApi');
const mockRefreshToken = authApi.refreshToken as jest.MockedFunction<typeof authApi.refreshToken>;

const mockCandidate = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: null,
  address: null,
  source: null,
  notes: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdBy: 'user-1',
  educations: [],
  workExperiences: [],
  cv: null,
};

const fetchMock = jest.fn();
global.fetch = fetchMock;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

beforeEach(() => {
  fetchMock.mockReset();
  jest.clearAllMocks();
  setAccessToken('test-access-token');
});

describe('createCandidate', () => {
  it('creates a candidate without CV using JSON body', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(201, { success: true, data: mockCandidate }),
    );

    const result = await createCandidate({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    });

    expect(result.id).toBe(1);
    expect(result.email).toBe('jane@example.com');
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/candidates');
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('creates a candidate with CV using multipart FormData', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(201, {
        success: true,
        data: {
          ...mockCandidate,
          cv: {
            id: 1,
            filename: 'cv.pdf',
            contentType: 'application/pdf',
            sizeBytes: 1024,
            uploadedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      }),
    );

    const file = new File(['pdf content'], 'cv.pdf', { type: 'application/pdf' });
    const result = await createCandidate({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      cvFile: file,
    });

    expect(result.cv).not.toBeNull();
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.headers as Record<string, string>)['Content-Type']).toBeUndefined();
  });

  it('attaches Authorization: Bearer header from in-memory token store', async () => {
    setAccessToken('my-access-token');
    fetchMock.mockResolvedValue(
      mockResponse(201, { success: true, data: mockCandidate }),
    );

    await createCandidate({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer my-access-token');
  });

  it('does not attach Authorization header when no token is set', async () => {
    setAccessToken(null);
    fetchMock.mockResolvedValue(
      mockResponse(201, { success: true, data: mockCandidate }),
    );

    await createCandidate({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('on 401 calls refreshToken and retries the original request', async () => {
    mockRefreshToken.mockResolvedValueOnce({ accessToken: 'refreshed-token', expiresIn: 900 });

    fetchMock
      .mockResolvedValueOnce(mockResponse(401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Expired' } }))
      .mockResolvedValueOnce(mockResponse(201, { success: true, data: mockCandidate }));

    const result = await createCandidate({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' });

    expect(result.id).toBe(1);
    expect(mockRefreshToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, secondOptions] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect((secondOptions.headers as Record<string, string>)['Authorization']).toBe('Bearer refreshed-token');
  });

  it('throws ApiError with status 401 when refresh also fails', async () => {
    mockRefreshToken.mockRejectedValueOnce(new ApiError(401, 'UNAUTHORIZED', 'Session expired'));

    fetchMock.mockResolvedValueOnce(
      mockResponse(401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Expired' } }),
    );

    await expect(
      createCandidate({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' }),
    ).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws ApiError with fieldErrors on 400 response', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fieldErrors: { email: 'Invalid email format' },
        },
      }),
    );

    try {
      await createCandidate({ firstName: 'Jane', lastName: 'Doe', email: 'bad-email' });
      fail('Expected ApiError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(400);
      expect((err as ApiError).fieldErrors?.email).toBe('Invalid email format');
    }
  });

  it('throws ApiError on 409 conflict', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(409, {
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: 'Email already exists' },
      }),
    );

    try {
      await createCandidate({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' });
      fail('Expected ApiError to be thrown');
    } catch (err) {
      expect((err as ApiError).status).toBe(409);
      expect((err as ApiError).code).toBe('DUPLICATE_EMAIL');
    }
  });

  it('throws ApiError on 500 server error', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(500, {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      }),
    );

    await expect(
      createCandidate({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' }),
    ).rejects.toThrow(ApiError);
  });
});

describe('getCandidateById', () => {
  it('returns the candidate on 200 response', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(200, { success: true, data: mockCandidate }),
    );

    const result = await getCandidateById(1);

    expect(result.id).toBe(1);
    expect(result.firstName).toBe('Jane');
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/candidates/1');
  });

  it('throws ApiError with status 404 when candidate not found', async () => {
    fetchMock.mockResolvedValue(
      mockResponse(404, {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Candidate not found' },
      }),
    );

    try {
      await getCandidateById(999);
      fail('Expected ApiError to be thrown');
    } catch (err) {
      expect((err as ApiError).status).toBe(404);
      expect((err as ApiError).code).toBe('NOT_FOUND');
    }
  });
});
