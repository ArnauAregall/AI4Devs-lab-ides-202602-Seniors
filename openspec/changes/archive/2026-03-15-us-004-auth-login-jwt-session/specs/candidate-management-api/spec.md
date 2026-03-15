## MODIFIED Requirements

### Requirement: Authentication and authorization for candidate operations
The system SHALL restrict candidate creation and retrieval endpoints to authenticated users with recruiter-equivalent permissions. Authentication MUST be enforced by validating the `Authorization: Bearer <token>` header against the JWT secret on every request; hardcoded bypass mechanisms SHALL NOT exist in production code.

#### Scenario: Unauthenticated access blocked
- **WHEN** an unauthenticated client (no `Authorization` header) attempts to call any candidate management endpoint
- **THEN** the system SHALL return `401 Unauthorized` without exposing candidate data

#### Scenario: Request with expired token is blocked
- **WHEN** a client submits an `Authorization: Bearer <token>` header where the token's `exp` claim is in the past
- **THEN** the system SHALL return `401 Unauthorized` with `code: "UNAUTHORIZED"`

#### Scenario: Request with tampered token is blocked
- **WHEN** a client submits an `Authorization: Bearer <token>` header where the token signature is invalid
- **THEN** the system SHALL return `401 Unauthorized` with `code: "UNAUTHORIZED"`

#### Scenario: Unauthorized role blocked
- **WHEN** an authenticated user without recruiter-equivalent permissions attempts to call a candidate management endpoint
- **THEN** the system SHALL return `403 Forbidden` and SHALL NOT perform the requested operation
