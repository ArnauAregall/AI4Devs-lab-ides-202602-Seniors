## Why

Authenticated users currently have no way to update their own password from within the application. Providing a secure change-password flow reduces reliance on admin resets, improves account ownership, and closes a common security gap.

## What Changes

- Add a `PATCH /api/auth/password` endpoint that accepts the current password and the new password, validates both, hashes the new password, and persists the update.
- Add a `ChangePasswordForm` React component accessible only to authenticated users (e.g., from an Account/Settings page).
- Enforce password-strength rules (min 8 chars, uppercase, lowercase, digit, special character) on both client and server.
- Optionally invalidate all other active sessions after a successful password change.

## Capabilities

### New Capabilities

- `change-password-api`: Backend endpoint (`PATCH /api/auth/password`) that verifies the current password, validates the new password, hashes it, and updates the database record. Optionally invalidates other sessions.
- `change-password-form`: Frontend form component with three fields (current password, new password, confirm new password), inline validation messages, and a success confirmation message.

### Modified Capabilities

- `auth-endpoints`: The change-password endpoint extends the existing authentication API surface; no existing endpoint requirements change, but the spec should reference the new endpoint.

## Impact

- **Backend**: New route handler and application-service method; password hashing utility (bcrypt) already in use; Prisma `User` model update.
- **Frontend**: New React component and service-layer call; route guard to restrict access to authenticated users.
- **Sessions**: If session invalidation is implemented, the session store (JWT blocklist or cookie clearing) will be affected.
- **Dependencies**: No new runtime dependencies expected; bcrypt and existing auth middleware already present.
