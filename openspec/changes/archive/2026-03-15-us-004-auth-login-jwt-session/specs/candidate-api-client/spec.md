## MODIFIED Requirements

### Requirement: API client attaches the Authorization header
The frontend API client SHALL read the access token from the in-memory authentication store (React context or module-level variable) and attach it as an `Authorization: Bearer <token>` header on every outgoing request. The client SHALL NOT read the token from `REACT_APP_API_TOKEN`, `localStorage`, or `sessionStorage`.

#### Scenario: API client attaches the Authorization header from in-memory store
- **WHEN** any function in the API client is called while a valid in-memory access token exists
- **THEN** the outgoing HTTP request SHALL include the header `Authorization: Bearer <token>` where the token value is read from the in-memory auth store

#### Scenario: API client does not fall back to REACT_APP_API_TOKEN
- **WHEN** `REACT_APP_API_TOKEN` is set in the environment but no in-memory token is present
- **THEN** the API client SHALL NOT attach that value as a Bearer token; instead the request is sent without an `Authorization` header (which the server rejects with `401`)

## ADDED Requirements

### Requirement: API client performs a single silent token refresh on 401 responses
When any API function returns a `401 Unauthorized` response, the client SHALL call `POST /api/v1/auth/refresh` exactly once. If the refresh returns a new access token, the original request SHALL be retried with the new token and the caller receives the successful result. If the refresh also returns `401`, the client SHALL throw an `ApiError` with `status: 401` and SHALL NOT retry further.

#### Scenario: 401 triggers one silent refresh and retries original request
- **WHEN** a candidate API call returns `401` and the subsequent `POST /api/v1/auth/refresh` returns a new access token
- **THEN** the original request SHALL be retried with the new token and the caller SHALL receive the successful result transparently

#### Scenario: Failed refresh after 401 throws ApiError with status 401
- **WHEN** a candidate API call returns `401` and the subsequent `POST /api/v1/auth/refresh` also returns `401`
- **THEN** the client SHALL throw an `ApiError` with `status: 401` and SHALL NOT attempt any further retries
