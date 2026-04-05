## User Story: Authentication – Change Password (Self-Service)

**ID**: US-005

**As a** logged-in recruiter,  
**I want** to change my account password from within the application,  
**so that** I can keep my credentials strong without administrator intervention and reduce reliance on shared or stale passwords.

---

### Background & Motivation

US-004 delivered login, JWT access tokens, `HttpOnly` refresh cookies, protected routes, and silent refresh. Users still had no self-service way to rotate their password. This story adds an authenticated **change-password** API and a **Settings** page so recruiters can verify their current password, set a new one that meets strength rules, and stay aligned with security expectations.

**Source specification**: OpenSpec change archived at `openspec/changes/archive/2026-04-05-change-password/` (proposal, design, tasks, delta specs). Merged **canonical** requirements live under `openspec/specs/`: `auth-endpoints` (change-password on the auth router), `change-password-api`, and `change-password-form`.

---

### Functional Scope

#### In scope

**Backend**

| Method  | Path                         | Purpose                                                                                                                                 |
| ------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `PATCH` | `/api/v1/auth/password`      | Authenticated user submits `currentPassword`, `newPassword`, and `confirmNewPassword`; server verifies current hash, validates strength, updates bcrypt hash |

- Route registered on the auth router **behind** the existing `authenticate` middleware (Bearer access JWT required).
- Password strength (server-enforced): minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one special character; distinct error messages per rule.
- On **success**: respond with `200` and body `{ "success": true, "message": "Your password has been changed successfully." }` and clear the `refreshToken` cookie (`Max-Age=0`, same path/attributes as logout) so the current browser session cannot silently refresh indefinitely after the change.
- On validation failure: `400` with structured `fieldErrors` (incorrect current password, strength, or mismatch).

**Frontend**

- Protected route `/settings` rendering `ChangePasswordPage` with three fields: current password, new password, confirm new password.
- Client-side validation mirroring backend rules (`validateChangePasswordForm` / `changePasswordValidation.ts`).
- `changePassword` in `authApi.ts` calling `PATCH /api/v1/auth/password` with `Authorization: Bearer`.
- Inline field errors, loading state on submit, success message on `200`; server `400` maps errors to fields and clears password inputs per spec.

#### Out of scope

- Forgot-password / email-based **reset** (unauthenticated).
- Admin changing another user’s password.
- MFA or step-up challenges beyond supplying the current password.
- Email notifications on password change.
- Global revocation of all sessions via token blocklist (stateless JWT; refresh cookie clear is the scoped mitigation).

---

### API Design

#### `PATCH /api/v1/auth/password`

- **Headers**: `Authorization: Bearer <accessToken>` (required).
- **Request body** (`application/json`):
  ```json
  {
    "currentPassword": "OldStr0ng!",
    "newPassword": "NewStr0ng!",
    "confirmNewPassword": "NewStr0ng!"
  }
  ```
- **Success** — `200 OK`:
  ```json
  {
    "success": true,
    "message": "Your password has been changed successfully."
  }
  ```
  Includes `Set-Cookie` clearing the refresh token for the auth path.
- **Failure**:
  - `401` — missing or invalid access token.
  - `400` — validation / business rules (field-level errors for current password, new password strength, or confirmation mismatch).

---

### Security & Non-Functional Requirements

- New password hashed with **bcrypt** at cost factor **12** before persistence; plaintext passwords never logged or stored.
- Strength rules enforced on **both** client (UX) and server (authoritative).
- Current password verified with `bcrypt.compare` against the authenticated user’s stored hash before any update.

---

### Implementation Notes

- **Backend**: `AuthService.changePassword`, `authValidator` (including `validatePasswordStrength`), `AuthController.changePassword`, `PATCH` on `authRoutes.ts`; Swagger documented alongside other auth endpoints.
- **Frontend**: `ChangePasswordPage` + CSS module; route in `App.tsx` wrapped with `ProtectedRoute`.

---

### Testing Requirements

#### Backend

- Unit tests: password strength helper, `AuthService.changePassword` (wrong current password, each strength failure, mismatch, success).
- Controller tests: authenticated vs unauthenticated, field errors, success with cookie clear behavior as applicable.

#### Frontend

- Unit tests: `validateChangePasswordForm` (empty fields, each rule, mismatch, valid).
- Component tests: `ChangePasswordPage` — fields, validation, loading, success, server errors.

---

### Definition of Done

- `PATCH /api/v1/auth/password` implemented, tested, and listed in Swagger/OpenAPI with the auth group.
- `/settings` is protected; unauthenticated users are redirected to `/login`.
- Client and server validation align; success and error UX match the OpenSpec scenarios.
- `backend/README.md` and `frontend/README.md` describe the endpoint and route; architecture doc includes the change-password flow and pointers to `openspec/specs/`.
- Requirements are reflected in `openspec/specs/` (`auth-endpoints`, `change-password-api`, `change-password-form`); the change archive is at `openspec/changes/archive/2026-04-05-change-password/`.
- All relevant automated tests pass.
