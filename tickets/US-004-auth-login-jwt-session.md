## User Story: Authentication – Login Flow & JWT Session Management

**ID**: US-004

**As a** recruiter using the ATS,  
**I want** to log in with my credentials and have the application manage my session securely,  
**so that** only authenticated users can access candidate data and the system is protected against token leakage and session hijacking.

---

### Background & Motivation

The three previous user stories established the backend API (US-001), the database schema (US-002), and the recruiter-facing candidate form (US-003). However, authentication was never properly completed:

1. **Backend bypass**: The `authenticate` middleware in `backend/src/middleware/auth.ts` has its JWT verification logic commented out. It currently injects a hardcoded mock user (`userId: '1'`, `role: 'recruiter'`) on every request, meaning all routes are effectively public.

2. **Frontend static token**: US-003 reads a shared token from the `REACT_APP_API_TOKEN` environment variable and sends it as an `Authorization: Bearer` header. This approach fails fundamentally in a browser-based application:
   - The environment variable is baked into the compiled JavaScript bundle and is visible to any user who opens DevTools.
   - The token is shared across all users and sessions; it cannot be rotated per user or revoked individually.
   - There is no login, logout, or session expiry mechanism.

This user story closes both gaps by implementing a proper credential-based login flow, a secure token lifecycle using short-lived JWTs and `HttpOnly` refresh-token cookies, and re-enabling the existing backend middleware.

---

### Functional Scope

#### In scope

**Backend endpoints**

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/auth/login` | Accept `{ email, password }`, validate credentials, return a signed access JWT and set a `HttpOnly` refresh-token cookie |
| `POST` | `/api/v1/auth/refresh` | Accept the refresh-token cookie and return a new access JWT |
| `POST` | `/api/v1/auth/logout` | Clear the refresh-token cookie and invalidate the session |

**Backend middleware**

- Re-enable the JWT verification logic in `backend/src/middleware/auth.ts` (remove the hardcoded bypass and uncomment the real implementation).
- The `authenticate` middleware must be active on all protected routes:
  - `POST /api/v1/candidates`
  - `GET /api/v1/candidates/:id`
  - `POST /api/v1/candidates/:id/cv`

**User store**

- A minimal user table (or seeded in-memory store for this iteration) holding at least `id`, `email`, `hashed_password`, and `role`.
- Passwords must be hashed with **bcrypt** (cost factor ≥ 12) before storage; plaintext passwords must never be persisted or logged.

**Frontend**

- `/login` route — a login form with email and password fields that calls `POST /api/v1/auth/login`.
- A `ProtectedRoute` component (or equivalent guard) that redirects unauthenticated users to `/login` when accessing any protected route (`/`, `/candidates/new`).
- An in-memory access token store (React context or module-level variable) that holds the current JWT and is cleared on logout or page unload.
- All API calls in `candidatesApi.ts` attach the in-memory JWT as `Authorization: Bearer <token>`.
- On `401` response from any API call, attempt a silent token refresh via `POST /api/v1/auth/refresh`; on refresh failure redirect to `/login`.

#### Out of scope

- OAuth / OpenID Connect (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- User self-registration or password reset
- Email verification
- Admin user management UI
- Remember-me / "keep me logged in" persistent sessions (long-lived refresh tokens are acceptable but optional)
- Role assignment UI — roles remain seeded data for this iteration

---

### API Design

#### `POST /api/v1/auth/login`

- **Request body** (`application/json`):
  ```json
  { "email": "recruiter@example.com", "password": "s3cr3t!" }
  ```
- **Success response** — `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "<signed-jwt>",
      "expiresIn": 900
    }
  }
  ```
  Sets a `Set-Cookie` header with the refresh token:
  ```
  Set-Cookie: refreshToken=<value>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800
  ```
- **Failure responses**:
  - `400 Bad Request` — missing or malformed `email` / `password` fields.
  - `401 Unauthorized` — credentials do not match any user; return a generic message that does not reveal whether the email exists.
  - `429 Too Many Requests` — rate limit exceeded (see Non-Functional Requirements).

#### `POST /api/v1/auth/refresh`

- **Request**: no body required; relies on the `refreshToken` cookie being present.
- **Success response** — `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "<new-signed-jwt>",
      "expiresIn": 900
    }
  }
  ```
- **Failure responses**:
  - `401 Unauthorized` — cookie absent, expired, or invalid.

#### `POST /api/v1/auth/logout`

- **Request**: no body required.
- **Success response** — `204 No Content`.
- Clears the `refreshToken` cookie by setting `Max-Age=0`.

---

### Validation & Error Handling

- `email` must be a non-empty string in valid email format.
- `password` must be a non-empty string; no complexity rules enforced at the API layer (the user store controls actual credentials).
- Login failure must always return the same generic `401` message regardless of whether the email exists, to prevent user enumeration.
- Expired or tampered access tokens must return `401` with `code: "UNAUTHORIZED"`.
- The middleware must propagate `401` errors through the existing centralised error handler so they follow the same `{ success: false, error: { code, message } }` shape as other API errors.

---

### Security & Non-Functional Requirements

#### Token design

| Property | Value |
|----------|-------|
| Signing algorithm | **HS256** (HMAC-SHA256); upgrade path to RS256 documented but not required this iteration |
| Access token lifetime | **15 minutes** (`exp` claim) |
| Refresh token lifetime | **7 days** |
| JWT payload | `{ userId, email, role, iat, exp }` — no sensitive PII beyond email |
| Secret source | `JWT_SECRET` environment variable; must be ≥ 32 random bytes; must never appear in source code or frontend bundle |

#### Cookie attributes (refresh token)

| Attribute | Value | Reason |
|-----------|-------|--------|
| `HttpOnly` | true | Prevents JavaScript access; blocks XSS token theft |
| `Secure` | true (production) | Transmitted only over HTTPS |
| `SameSite` | `Strict` | Prevents CSRF on the refresh endpoint |
| `Path` | `/api/v1/auth` | Scoped to auth routes only; not sent with candidate API calls |
| `Max-Age` | 604800 (7 days) | Matches refresh token expiry |

#### Frontend token storage

- The access JWT **must** be stored in a JavaScript module-level variable or React context only (in-memory).
- The access JWT **must not** be stored in `localStorage`, `sessionStorage`, or any browser cookie accessible to JavaScript.
- On page refresh or tab close the access JWT is lost; the application silently restores it using the `HttpOnly` refresh cookie before rendering protected content.

#### Brute-force protection

- The `/api/v1/auth/login` endpoint must be rate-limited to a maximum of **10 requests per minute per IP address** using a sliding-window counter.
- Exceeding the limit returns `429 Too Many Requests` with a `Retry-After` header.

#### Transport security

- All auth endpoints must only be called over HTTPS in production (`NODE_ENV=production`); in development HTTP is allowed for local testing.
- No JWT secrets, hashed passwords, or credentials may appear in logs.

---

### Implementation Notes

#### Backend

- Add an `auth` router at `backend/src/routes/authRoutes.ts`, mounted at `/api/v1/auth`.
- Create `AuthController`, `AuthService`, and `UserRepository` (or equivalent), following the same layered architecture as the candidate module.
- Use `jsonwebtoken` (already a dependency) for signing and verifying tokens.
- Use `bcryptjs` or `bcrypt` for password hashing.
- Use `express-rate-limit` for the login rate limiter.
- Use `cookie-parser` middleware to read the `refreshToken` cookie in `POST /api/v1/auth/refresh`.
- Remove the hardcoded bypass block from `authenticate` in `auth.ts` and restore the commented-out verification logic.

#### Frontend

- Add a `LoginPage` component at `frontend/src/pages/LoginPage.tsx` with email and password fields, a submit button, and an inline error area.
- Add a `ProtectedRoute` wrapper component that checks for a valid in-memory token (or attempts a silent refresh) before rendering children; redirects to `/login` if no valid session can be established.
- Update `frontend/src/App.tsx` to add the `/login` route and wrap `/` and `/candidates/new` with `ProtectedRoute`.
- Update `frontend/src/api/candidatesApi.ts` to read the access token from the in-memory store instead of `process.env.REACT_APP_API_TOKEN`; add a `401` interceptor that calls `POST /api/v1/auth/refresh` once and retries the original request.
- Remove `REACT_APP_API_TOKEN` from `frontend/.env`; document the change in `frontend/README.md`.

---

### Testing Requirements

#### Backend — unit tests

- `AuthService.login`: valid credentials return access token + refresh token; invalid credentials throw `UnauthorizedError`; missing fields throw `ValidationError`.
- `AuthService.refresh`: valid refresh token returns new access token; expired or tampered token throws `UnauthorizedError`.
- `authenticate` middleware: valid Bearer token sets `req.user`; missing header returns `401`; expired token returns `401`; tampered token returns `401`.

#### Backend — integration tests

- `POST /api/v1/auth/login` — happy path: `200`, returns `accessToken`, sets `Set-Cookie` with `HttpOnly` refresh token.
- `POST /api/v1/auth/login` — wrong password: `401` with generic message.
- `POST /api/v1/auth/login` — missing fields: `400` with `fieldErrors`.
- `POST /api/v1/auth/login` — exceeds rate limit: `429` with `Retry-After` header.
- `POST /api/v1/auth/refresh` — valid cookie: `200`, returns new `accessToken`.
- `POST /api/v1/auth/refresh` — missing cookie: `401`.
- `POST /api/v1/auth/logout` — clears cookie: `204`, `Set-Cookie` with `Max-Age=0`.
- `POST /api/v1/candidates` — no token: `401`.
- `POST /api/v1/candidates` — valid token: `201` (existing happy-path test must continue to pass with auth re-enabled).
- `GET /api/v1/candidates/:id` — no token: `401`.

#### Frontend — unit / component tests

- `LoginPage`: renders email and password fields; submit with empty fields shows inline errors; successful login stores token and redirects to `/`; failed login shows server error message.
- `ProtectedRoute`: unauthenticated user is redirected to `/login`; authenticated user renders children.
- `candidatesApi.ts`: attaches `Authorization: Bearer <token>` header; on `401` calls refresh and retries; on refresh failure throws `ApiError` with status `401`.

---

### Definition of Done

- [ ] `POST /api/v1/auth/login` implemented, tested, and documented in OpenAPI.
- [ ] `POST /api/v1/auth/refresh` implemented, tested, and documented in OpenAPI.
- [ ] `POST /api/v1/auth/logout` implemented, tested, and documented in OpenAPI.
- [ ] Hardcoded bypass removed from `backend/src/middleware/auth.ts`; JWT verification is the only code path.
- [ ] `authenticate` middleware active on all candidate routes; no route is accidentally left unprotected.
- [ ] `LoginPage` component implemented with client-side validation and server-error display.
- [ ] `ProtectedRoute` redirects unauthenticated users to `/login`.
- [ ] Access token stored in memory only; `REACT_APP_API_TOKEN` removed from frontend.
- [ ] Silent token refresh on `401` implemented in `candidatesApi.ts`.
- [ ] All existing backend tests continue to pass with authentication re-enabled.
- [ ] All new backend and frontend tests listed above are passing.
- [ ] OpenAPI documentation updated for all three auth endpoints.
- [ ] `frontend/README.md` and `backend/README.md` updated to document the new auth flow and required environment variables (`JWT_SECRET`).
- [ ] `JWT_SECRET` is not committed to source control; `.env.example` documents the variable with a placeholder value.
