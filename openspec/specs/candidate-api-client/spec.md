## ADDED Requirements

### Requirement: API client provides a typed function to create a candidate
The frontend API client SHALL expose a `createCandidate` function that accepts typed candidate form data and an optional CV file, submits to `POST /api/v1/candidates`, and returns a typed result.

#### Scenario: Create candidate without CV returns candidate data
- **WHEN** `createCandidate` is called with valid candidate fields and no CV file
- **THEN** the function SHALL submit a `POST /api/v1/candidates` request with `Content-Type: application/json` and SHALL return the created candidate object on a `201` response

#### Scenario: Create candidate with CV submits multipart form data
- **WHEN** `createCandidate` is called with valid candidate fields and a CV `File` object
- **THEN** the function SHALL submit a `POST /api/v1/candidates` request with `Content-Type: multipart/form-data`, SHALL include the CV file as the `cvFile` part, and SHALL return the created candidate object on a `201` response

#### Scenario: API client attaches the Authorization header
- **WHEN** `createCandidate` is called
- **THEN** the HTTP request SHALL include an `Authorization: Bearer <token>` header

### Requirement: API client provides a typed function to retrieve a candidate by ID
The frontend API client SHALL expose a `getCandidateById` function that fetches `GET /api/v1/candidates/{id}` and returns a typed candidate object.

#### Scenario: Retrieve existing candidate returns typed data
- **WHEN** `getCandidateById` is called with a valid candidate ID
- **THEN** the function SHALL submit a `GET /api/v1/candidates/{id}` request and SHALL return the candidate object on a `200` response

#### Scenario: Retrieve non-existent candidate throws a typed error
- **WHEN** `getCandidateById` is called with an ID that does not exist
- **THEN** the function SHALL throw or reject with a typed `ApiError` containing the `404` status code and the `NOT_FOUND` error code

### Requirement: API client parses and exposes structured error responses
When the API returns a non-2xx response, the client SHALL parse the response body and throw a typed `ApiError` containing the HTTP status code, error code, message, and optional `fieldErrors`.

#### Scenario: Validation error response is parsed into ApiError with fieldErrors
- **WHEN** the API responds with `400` and a body containing `fieldErrors`
- **THEN** the client SHALL throw an `ApiError` with `status: 400` and a `fieldErrors` object keyed by field name

#### Scenario: Generic server error response is parsed into ApiError
- **WHEN** the API responds with a `5xx` status
- **THEN** the client SHALL throw an `ApiError` with the corresponding status code and a generic error code

### Requirement: API client base URL is configurable via environment variable
The API client SHALL read the backend base URL from the `REACT_APP_API_URL` environment variable and SHALL prepend it to all request paths.

#### Scenario: Client uses configured base URL
- **WHEN** `REACT_APP_API_URL` is set to `http://localhost:3010`
- **THEN** all requests from the API client SHALL be sent to URLs beginning with `http://localhost:3010`
