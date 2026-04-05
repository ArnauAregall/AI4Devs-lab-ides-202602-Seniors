## ADDED Requirements

### Requirement: Change-password endpoint is part of the authentication API surface
The system SHALL expose `PATCH /api/v1/auth/password` as part of the authentication router, consistent with the existing `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, and `POST /api/v1/auth/logout` endpoints. The endpoint SHALL require a valid access token via the `authenticate` middleware.

#### Scenario: Change-password endpoint is reachable under /api/v1/auth
- **WHEN** a request is made to `PATCH /api/v1/auth/password` with a valid access token
- **THEN** the request SHALL be handled by the authentication router and SHALL not return `404`

#### Scenario: Change-password endpoint without access token returns 401
- **WHEN** a request is made to `PATCH /api/v1/auth/password` without an `Authorization` header
- **THEN** the `authenticate` middleware SHALL reject the request with `401 Unauthorized`
