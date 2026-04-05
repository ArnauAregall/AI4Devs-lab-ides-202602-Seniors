## ADDED Requirements

### Requirement: Change-password endpoint verifies current password before accepting the new one
The system SHALL expose `PATCH /api/v1/auth/password` behind the `authenticate` middleware. It SHALL accept a JSON body with `currentPassword`, `newPassword`, and `confirmNewPassword`. It SHALL compare `currentPassword` against the authenticated user's stored bcrypt hash and reject the request if they do not match.

#### Scenario: Correct current password proceeds to further validation
- **WHEN** an authenticated user submits `PATCH /api/v1/auth/password` with a `currentPassword` that matches the stored bcrypt hash
- **THEN** the system SHALL continue to validate `newPassword` and `confirmNewPassword`

#### Scenario: Incorrect current password returns 400 with specific error
- **WHEN** an authenticated user submits `PATCH /api/v1/auth/password` with a `currentPassword` that does not match the stored bcrypt hash
- **THEN** the response SHALL be `400 Bad Request` with a field error `{ "field": "currentPassword", "message": "Current password is incorrect." }`

#### Scenario: Unauthenticated request returns 401
- **WHEN** `PATCH /api/v1/auth/password` is called without a valid `Authorization: Bearer` access token
- **THEN** the response SHALL be `401 Unauthorized`

#### Scenario: Missing required fields returns 400
- **WHEN** `PATCH /api/v1/auth/password` is called with any of `currentPassword`, `newPassword`, or `confirmNewPassword` absent from the body
- **THEN** the response SHALL be `400 Bad Request` with structured `fieldErrors` listing the missing fields

### Requirement: Change-password endpoint enforces password strength on the new password
The `PATCH /api/v1/auth/password` endpoint SHALL validate that `newPassword` meets all of the following rules: minimum 8 characters, at least one uppercase letter, at least one lowercase letter, at least one digit, at least one special character. A distinct error message SHALL be returned for each unmet rule.

#### Scenario: New password shorter than 8 characters returns specific error
- **WHEN** `newPassword` has fewer than 8 characters
- **THEN** the response SHALL be `400 Bad Request` with a field error `{ "field": "newPassword", "message": "Password must be at least 8 characters long." }`

#### Scenario: New password missing uppercase letter returns specific error
- **WHEN** `newPassword` contains no uppercase letter
- **THEN** the response SHALL be `400 Bad Request` with a field error `{ "field": "newPassword", "message": "Password must contain at least one uppercase letter." }`

#### Scenario: New password missing lowercase letter returns specific error
- **WHEN** `newPassword` contains no lowercase letter
- **THEN** the response SHALL be `400 Bad Request` with a field error `{ "field": "newPassword", "message": "Password must contain at least one lowercase letter." }`

#### Scenario: New password missing digit returns specific error
- **WHEN** `newPassword` contains no digit
- **THEN** the response SHALL be `400 Bad Request` with a field error `{ "field": "newPassword", "message": "Password must contain at least one digit." }`

#### Scenario: New password missing special character returns specific error
- **WHEN** `newPassword` contains no special character
- **THEN** the response SHALL be `400 Bad Request` with a field error `{ "field": "newPassword", "message": "Password must contain at least one special character." }`

#### Scenario: New password meeting all strength rules passes validation
- **WHEN** `newPassword` is at least 8 characters and contains uppercase, lowercase, digit, and special character
- **THEN** the system SHALL proceed to confirm-password match validation

### Requirement: Change-password endpoint validates that new password and confirmation match
The `PATCH /api/v1/auth/password` endpoint SHALL verify that `newPassword` and `confirmNewPassword` are identical.

#### Scenario: Mismatched new password and confirmation returns 400
- **WHEN** `newPassword` and `confirmNewPassword` differ
- **THEN** the response SHALL be `400 Bad Request` with a field error `{ "field": "confirmNewPassword", "message": "Passwords do not match." }`

#### Scenario: Matching new password and confirmation passes
- **WHEN** `newPassword` equals `confirmNewPassword`
- **THEN** the system SHALL proceed to hash and persist the new password

### Requirement: Change-password endpoint hashes and persists the new password only when all validations pass
The `PATCH /api/v1/auth/password` endpoint SHALL hash the validated `newPassword` using bcrypt with a cost factor of 12 and update the authenticated user's `hashedPassword` record in the database. No partial update SHALL occur if any validation step fails.

#### Scenario: Successful password change returns 200 and clears refresh cookie
- **WHEN** all three fields are valid, `currentPassword` matches, `newPassword` meets strength rules, and `newPassword` equals `confirmNewPassword`
- **THEN** the response SHALL be `200 OK` with body `{ "success": true, "message": "Your password has been changed successfully." }` and a `Set-Cookie` header clearing the `refreshToken` cookie (`Max-Age=0`)

#### Scenario: No database write occurs when any validation fails
- **WHEN** any validation step (current password check, strength rules, or confirmation match) fails
- **THEN** the database SHALL NOT be updated and the response SHALL be the corresponding `400` error

### Requirement: Change-password endpoint clears the refresh-token cookie on success to invalidate the current session's refresh capability
After successfully updating the password, the `PATCH /api/v1/auth/password` endpoint SHALL clear the `refreshToken` cookie using the same `Set-Cookie: refreshToken=; Max-Age=0; Path=/api/v1/auth` pattern used by the logout endpoint.

#### Scenario: Refresh cookie is cleared after successful password change
- **WHEN** the password is successfully changed
- **THEN** the response SHALL include `Set-Cookie: refreshToken=; Max-Age=0; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict`
