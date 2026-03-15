## Context

The existing codebase has all the scaffolding for JWT authentication but it has never been activated. The backend `authenticate` middleware in `src/middleware/auth.ts` has its real `jwt.verify` logic commented out behind a `/* ... */` block; instead it unconditionally injects a hardcoded mock user and calls `next()`. On the frontend, `candidatesApi.ts` reads `REACT_APP_API_TOKEN` — a static string baked into the compiled bundle — and forwards it verbatim as a `Bearer` header. Neither mechanism provides any real security.

The backend already depends on `jsonwebtoken`. No auth routing, user storage, or session lifecycle exists yet.

## Goals / Non-Goals

**Goals:**
- Introduce a fully working credential-based login flow (email + password → signed JWT).
- Implement a secure refresh-token cycle using an `HttpOnly` cookie so the frontend can silently restore sessions without re-prompting the user.
- Restore real JWT verification in the `authenticate` middleware and ensure every candidate route is protected.
- Replace the static `REACT_APP_API_TOKEN` with dynamic in-memory token management in the frontend.

**Non-Goals:**
- OAuth, SSO, or third-party identity providers.
- Multi-factor authentication.
- User self-service (registration, password reset, email verification).
- Long-lived "remember me" tokens beyond the 7-day refresh window.
- Refresh token rotation or refresh token family invalidation (deferred to a hardening pass).

## Decisions

### Decision 1: HS256 access tokens (not RS256)

**Chosen**: HS256 with a single `JWT_SECRET` environment variable.  
**Alternative**: RS256 with a public/private key pair — better for distributed verification but requires key management infrastructure not yet in place.  
**Rationale**: The backend is a single service; HS256 is sufficient. The spec documents the RS256 upgrade path explicitly so the choice is reversible. Secret rotation is simpler than key rotation at this stage.

### Decision 2: Access token in memory, refresh token in `HttpOnly` cookie

**Chosen**: Store the access JWT in a JavaScript module-level variable (React context) on the frontend; store the refresh token exclusively in a `HttpOnly; Secure; SameSite=Strict` cookie scoped to `/api/v1/auth`.  
**Alternative 1**: Store access token in `localStorage` — simpler, survives page reload, but exposes the token to any JavaScript (XSS attack surface).  
**Alternative 2**: Store access token in a `HttpOnly` cookie too — fully opaque to JS, but requires the backend to accept cookies on candidate routes (CSRF complexity) and makes the `Authorization: Bearer` pattern more awkward.  
**Rationale**: The access token is short-lived (15 min) so losing it on page reload is low cost. The silent-refresh-on-load pattern restores it transparently using the `HttpOnly` refresh cookie before rendering protected content. This is the recognised best practice for SPAs.

### Decision 3: Minimal user table via Prisma, seeded for development

**Chosen**: Add a `User` model to the Prisma schema (`id`, `email`, `hashedPassword`, `role`). In development, seed one `recruiter` user. No user management endpoints in this iteration.  
**Alternative**: In-memory user fixture (no DB table) — simpler but not production-viable and cannot survive restarts.  
**Rationale**: A Prisma model is consistent with the existing infrastructure pattern and aligns with the audit requirement that `createdBy` in the `candidates` table references a real user identity.

### Decision 4: `AuthService` issues and verifies both token types

**Chosen**: `AuthService` contains `login()`, `refreshAccessToken()`, and `logout()` methods. It never exposes the raw secret — all token operations are encapsulated.  
**Alternative**: Inline token logic in the controller — simpler but untestable at the unit level.  
**Rationale**: Consistent with the existing layered architecture (`CandidateService`, `PrismaCandidateRepository`). Unit tests for `AuthService` can run without HTTP or a real DB.

### Decision 5: Rate limiting via `express-rate-limit` on the login route only

**Chosen**: Add `express-rate-limit` (10 req/min/IP, sliding window) as a middleware applied only to `POST /api/v1/auth/login`.  
**Alternative**: Apply rate limiting globally — safer but risks false positives on legitimate high-traffic routes.  
**Rationale**: The login endpoint is the primary brute-force target. Other endpoints are protected by token validation. Limiting scope minimises operational risk.

### Decision 6: Single-attempt silent refresh in `candidatesApi.ts`

**Chosen**: On receiving a `401` from any candidate API call, the client calls `POST /api/v1/auth/refresh` once. If it succeeds, it retries the original request with the new token. If it fails, it throws an `ApiError` with `status: 401` and the caller navigates to `/login`.  
**Alternative**: Retry indefinitely until the refresh cookie also expires — risks infinite loops.  
**Rationale**: One retry is sufficient; a second `401` after a fresh token means the refresh cookie is also expired or revoked, and re-authentication is the only correct action.

## Risks / Trade-offs

- **Access token lost on hard reload** → Silent refresh on app load compensates; the `ProtectedRoute` component must trigger the refresh before rendering, adding a brief loading state.
- **Cookie `SameSite=Strict` blocks refresh from cross-origin tabs** → Acceptable because both frontend and backend share the same origin in the target deployment (and in development via CORS proxy or same host).
- **User enumeration on login** → Login always returns the same generic `401` message regardless of whether the email is known. Timing attacks are partially mitigated by always running `bcrypt.compare` (even on a dummy hash) to make the response time uniform.
- **Test disruption from re-enabling `authenticate`** → All existing integration tests for candidate routes will fail with `401`. Tests must be updated to either supply a valid signed token (preferred) or inject a mocked `req.user` via the test setup.

## Migration Plan

1. Add `User` model to `schema.prisma` and generate a migration (`add_user_table`).
2. Add a seed entry for the default recruiter user (bcrypt-hashed password).
3. Implement `authRoutes`, `AuthController`, `AuthService`, and `UserRepository`.
4. Uncomment and restore the real JWT verification block in `authenticate`.
5. Update `candidateRoutes.ts` to ensure `authenticate` is called before `requireRole` (it already is in the route definition; verify no accidental removal).
6. Update all backend integration tests to authenticate before calling protected routes.
7. Implement frontend auth module: `authApi.ts`, `AuthContext`, `LoginPage`, `ProtectedRoute`.
8. Update `App.tsx` routing and `candidatesApi.ts` token handling.
9. Remove `REACT_APP_API_TOKEN` from `.env` and update `README.md`.

**Rollback**: If re-enabling `authenticate` causes critical failures, the bypass block can be re-inserted temporarily by reverting `auth.ts`. The new `authRoutes` are additive and do not break existing routes even if the middleware is not yet active.

## Open Questions

- Should the development seed user credentials be documented in `.env.example` or only in `README.md`? (Decision: `README.md` only — credentials should never appear in tracked config files, even as examples.)
- Cookie `Secure` attribute blocks the cookie in plain HTTP during local development. Should it be conditionally omitted in `NODE_ENV=development`? (Decision: Yes — conditionally set `secure: process.env.NODE_ENV === 'production'` in the cookie options.)
