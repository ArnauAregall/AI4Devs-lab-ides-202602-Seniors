## Why

All candidate API routes are currently unprotected: the `authenticate` middleware in the backend has its real JWT verification commented out and injects a hardcoded mock user on every request, while the frontend sends a static shared token baked into the JavaScript bundle. This means any request with or without a token can read and write candidate data, exposing PII with no session management or audit trail.

## What Changes

- **Backend**: Add `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, and `POST /api/v1/auth/logout` endpoints backed by a bcrypt-hashed user store.
- **Backend**: Remove the hardcoded bypass from `authenticate` middleware and restore real JWT verification (HS256, 15-minute access tokens, 7-day `HttpOnly` refresh-token cookie).
- **Backend**: Re-enable `authenticate` on all candidate routes (`POST /candidates`, `GET /candidates/:id`, `POST /candidates/:id/cv`).
- **Backend**: Add rate limiting (10 req/min per IP) on `POST /api/v1/auth/login` to prevent brute-force attacks.
- **Frontend**: Add a `/login` page with an email + password form that calls the login endpoint.
- **Frontend**: Add a `ProtectedRoute` guard that redirects unauthenticated users to `/login`.
- **Frontend**: Store the access JWT in memory only (never `localStorage`/`sessionStorage`); restore it silently on page load via the `HttpOnly` refresh cookie.
- **Frontend**: Update the API client to attach the in-memory JWT as `Authorization: Bearer` and retry on `401` with a silent refresh.
- **Frontend**: Remove `REACT_APP_API_TOKEN` — the static shared-token approach is replaced entirely.

## Capabilities

### New Capabilities

- `auth-endpoints`: Backend authentication REST API — login, token refresh, and logout endpoints with cookie-based refresh token lifecycle.
- `auth-session-frontend`: Frontend session management — login page, protected route guard, in-memory token store, and silent refresh behaviour.

### Modified Capabilities

- `candidate-management-api`: All candidate routes now REQUIRE a valid Bearer token; unauthenticated requests receive `401 Unauthorized`.
- `candidate-api-client`: The frontend API client now reads the access token from the in-memory auth store (not an env variable) and handles `401` responses with a one-shot silent refresh before propagating the error.

## Impact

- **Backend**: New `authRoutes.ts`, `AuthController`, `AuthService`, `UserRepository`; new dependencies `bcryptjs`, `express-rate-limit`, `cookie-parser`.
- **Frontend**: New `LoginPage`, `ProtectedRoute` component, `authApi.ts` client, `AuthContext` (or module-level token store); `App.tsx` route structure updated; `candidatesApi.ts` updated; `REACT_APP_API_TOKEN` removed from `.env`.
- **Existing tests**: All backend candidate route tests must be updated to supply a valid JWT or mock the middleware; existing frontend API client tests must be updated to use the new token source.
- **Security posture**: Moving from no authentication to session-managed JWT authentication is a breaking change for any client relying on the open API.
