## ADDED Requirements

### Requirement: Login endpoint authenticates a user by email and password
The system SHALL expose `POST /api/v1/auth/login` that accepts an `{ email, password }` JSON body, validates the credentials against the user store, and on success returns a signed short-lived access JWT in the response body and a `HttpOnly` refresh-token cookie in the response headers.

#### Scenario: Successful login returns access token and sets refresh cookie
- **WHEN** a valid `{ email, password }` is submitted to `POST /api/v1/auth/login`
- **THEN** the response SHALL be `200 OK` with body `{ success: true, data: { accessToken, expiresIn: 900 } }` and a `Set-Cookie` header with `refreshToken=<value>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800`

#### Scenario: Login with wrong password returns generic 401
- **WHEN** a known email is submitted with an incorrect password
- **THEN** the response SHALL be `401 Unauthorized` with a generic message that does not reveal whether the email exists

#### Scenario: Login with unknown email returns generic 401
- **WHEN** an email that does not exist in the user store is submitted
- **THEN** the response SHALL be `401 Unauthorized` with the same generic message as for a wrong password

#### Scenario: Login with missing required fields returns 400
- **WHEN** `POST /api/v1/auth/login` is called with an empty body or missing `email` or `password`
- **THEN** the response SHALL be `400 Bad Request` with structured `fieldErrors`

#### Scenario: Login with invalid email format returns 400
- **WHEN** the `email` field is present but not a valid email address
- **THEN** the response SHALL be `400 Bad Request` with a field error on `email`

### Requirement: Login endpoint enforces rate limiting to prevent brute-force attacks
The `POST /api/v1/auth/login` endpoint SHALL reject requests from an IP address that exceeds 10 requests per minute with a `429 Too Many Requests` response containing a `Retry-After` header.

#### Scenario: Rate limit exceeded returns 429 with Retry-After header
- **WHEN** an IP address submits more than 10 login requests within a 60-second sliding window
- **THEN** all subsequent requests within that window SHALL receive `429 Too Many Requests` with a `Retry-After` header indicating when the limit resets

### Requirement: Token refresh endpoint issues a new access token from the refresh cookie
The system SHALL expose `POST /api/v1/auth/refresh` that reads the `refreshToken` cookie, validates it, and on success returns a new signed access JWT in the response body.

#### Scenario: Valid refresh cookie returns new access token
- **WHEN** `POST /api/v1/auth/refresh` is called with a valid, unexpired `refreshToken` cookie
- **THEN** the response SHALL be `200 OK` with body `{ success: true, data: { accessToken, expiresIn: 900 } }`

#### Scenario: Missing refresh cookie returns 401
- **WHEN** `POST /api/v1/auth/refresh` is called without a `refreshToken` cookie
- **THEN** the response SHALL be `401 Unauthorized`

#### Scenario: Expired refresh cookie returns 401
- **WHEN** `POST /api/v1/auth/refresh` is called with a `refreshToken` cookie whose token has expired
- **THEN** the response SHALL be `401 Unauthorized`

#### Scenario: Tampered refresh token returns 401
- **WHEN** `POST /api/v1/auth/refresh` is called with a `refreshToken` cookie whose signature is invalid
- **THEN** the response SHALL be `401 Unauthorized`

### Requirement: Logout endpoint clears the refresh-token cookie
The system SHALL expose `POST /api/v1/auth/logout` that clears the `refreshToken` cookie by setting its `Max-Age` to `0` and returns `204 No Content`.

#### Scenario: Logout clears the refresh cookie
- **WHEN** `POST /api/v1/auth/logout` is called
- **THEN** the response SHALL be `204 No Content` with a `Set-Cookie` header setting `refreshToken=; Max-Age=0; Path=/api/v1/auth`

### Requirement: Access tokens are signed with HS256 and carry identity claims
Access tokens issued by the login and refresh endpoints SHALL be signed using HMAC-SHA256 (HS256) with the `JWT_SECRET` environment variable, SHALL expire after 15 minutes, and SHALL include the claims `userId`, `email`, `role`, `iat`, and `exp`.

#### Scenario: Access token payload contains expected claims
- **WHEN** a valid access token is decoded
- **THEN** the payload SHALL contain `userId`, `email`, `role`, `iat`, and `exp` where `exp - iat = 900`

#### Scenario: Access token is rejected after expiry
- **WHEN** the `authenticate` middleware receives an access token whose `exp` claim is in the past
- **THEN** the middleware SHALL call `next` with a `401 Unauthorized` error

### Requirement: Passwords are stored using bcrypt with a cost factor of at least 12
User passwords stored in the database SHALL be hashed using bcrypt with a cost factor of 12 or higher; plaintext passwords SHALL never be persisted or appear in logs.

#### Scenario: Stored password is a bcrypt hash
- **WHEN** a user record is retrieved from the database
- **THEN** the `hashedPassword` field SHALL begin with `$2b$` (bcrypt format) and SHALL have a cost factor of 12 or higher
