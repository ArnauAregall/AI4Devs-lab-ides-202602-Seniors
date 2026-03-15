## 1. Backend – Dependencies & Configuration

- [x] 1.1 Install `bcryptjs` and `@types/bcryptjs`, `cookie-parser` and `@types/cookie-parser`, and `express-rate-limit` in `backend/package.json`
- [x] 1.2 Add `JWT_SECRET` to `backend/.env` (≥ 32 random bytes) and add a placeholder entry to `backend/.env.example`; verify `JWT_SECRET` is listed in `.gitignore` exclusions
- [x] 1.3 Register `cookie-parser` middleware in `backend/src/index.ts` so `req.cookies` is populated for the refresh endpoint

## 2. Backend – User Model & Repository

- [x] 2.1 Add a `User` model to `backend/prisma/schema.prisma` with fields `id` (autoincrement PK), `email` (unique, varchar 255), `hashedPassword` (varchar 255), `role` (varchar 50), `createdAt` (DateTime), mapped to table `users`
- [x] 2.2 Generate and apply the Prisma migration: `npx prisma migrate dev --name add_user_table`; verify the `users` table is created with a unique index on `email`
- [x] 2.3 Create `backend/src/domain/models/User.ts` with a `User` class and `UserData` interface (`id`, `email`, `hashedPassword`, `role`, `createdAt`)
- [x] 2.4 Create `backend/src/domain/repositories/IUserRepository.ts` with `findByEmail(email: string): Promise<User | null>`
- [x] 2.5 Create `backend/src/infrastructure/repositories/PrismaUserRepository.ts` implementing `IUserRepository`
- [x] 2.6 Update `backend/prisma/seed.ts` to create a seed recruiter user (`recruiter@example.com`, bcrypt-hashed password, role `recruiter`); guard with `NODE_ENV=development` check

## 3. Backend – AuthService

- [x] 3.1 Create `backend/src/application/services/authService.ts` with `login(email, password)` method that verifies credentials using `bcryptjs.compare`, signs a 15-minute access JWT (HS256, payload `{ userId, email, role }`), signs a 7-day refresh JWT, and returns both
- [x] 3.2 Add `refreshAccessToken(refreshToken: string)` to `AuthService` that verifies the refresh JWT and returns a new signed 15-minute access JWT
- [x] 3.3 Write unit tests for `AuthService`: valid credentials return tokens; invalid password throws `UnauthorizedError`; unknown email throws `UnauthorizedError`; expired refresh token throws `UnauthorizedError`

## 4. Backend – AuthController & Routes

- [x] 4.1 Create `backend/src/application/validators/authValidator.ts` with a Zod schema validating `{ email, password }` and a `validateLoginInput` function
- [x] 4.2 Create `backend/src/presentation/controllers/authController.ts` with `login`, `refresh`, and `logout` methods following the same pattern as `CandidateController`
- [x] 4.3 Create `backend/src/routes/authRoutes.ts` mounting `POST /login` (with `express-rate-limit` at 10 req/min/IP), `POST /refresh`, and `POST /logout`; use `cookie-parser`-populated `req.cookies.refreshToken` in the refresh route
- [x] 4.4 Mount the auth router at `/api/v1/auth` in `backend/src/index.ts`
- [x] 4.5 Write integration tests for `POST /api/v1/auth/login`: `200` + access token + `Set-Cookie` on success; `401` with generic message on wrong password; `400` on missing fields; `429` after 11 rapid requests from the same IP
- [x] 4.6 Write integration tests for `POST /api/v1/auth/refresh`: `200` + new access token with valid cookie; `401` with missing cookie; `401` with expired/tampered token
- [x] 4.7 Write integration test for `POST /api/v1/auth/logout`: `204` + `Set-Cookie` clearing the cookie

## 5. Backend – Restore authenticate Middleware

- [x] 5.1 Remove the hardcoded bypass block (`req.user = { userId: '1', ... }; next(); return`) from `backend/src/middleware/auth.ts` and uncomment the real JWT verification logic (`jwt.verify(token, JWT_SECRET)`)
- [x] 5.2 Update unit tests in `auth.test.ts` (or equivalent): valid Bearer token sets `req.user`; missing header calls `next(401)`; expired token calls `next(401)`; tampered signature calls `next(401)`
- [x] 5.3 Update all existing backend integration tests for candidate routes to supply a valid signed JWT in the `Authorization: Bearer` header (sign a test token with the `JWT_SECRET` test value)

## 6. Backend – OpenAPI Documentation

- [x] 6.1 Add OpenAPI path definitions for `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, and `POST /api/v1/auth/logout` in `backend/src/index.ts` (or dedicated swagger config file), including request/response schemas and `429` response for login

## 7. Frontend – Auth API Client & Token Store

- [x] 7.1 Create `frontend/src/api/authApi.ts` with `login(email, password)` (calls `POST /api/v1/auth/login`, returns `{ accessToken, expiresIn }`), `refreshToken()` (calls `POST /api/v1/auth/refresh` with `credentials: 'include'`), and `logout()` (calls `POST /api/v1/auth/logout` with `credentials: 'include'`)
- [x] 7.2 Create `frontend/src/auth/AuthContext.tsx` with a React context that holds `accessToken: string | null`, `setAccessToken`, and `clearToken`; export a `useAuth` hook and an `AuthProvider` wrapper
- [x] 7.3 Wrap `<App>` with `<AuthProvider>` in `frontend/src/index.tsx`
- [x] 7.4 Update `frontend/src/api/candidatesApi.ts` to read the access token from `useAuth` (or the module-level store) instead of `process.env.REACT_APP_API_TOKEN`; add a `401` interceptor that calls `authApi.refreshToken()` once and retries the original request with the new token, propagating `ApiError(401)` on refresh failure
- [x] 7.5 Remove `REACT_APP_API_TOKEN` from `frontend/.env` and from the `candidatesApi.ts` import/usage

## 8. Frontend – Login Page & Protected Route

- [x] 8.1 Create `frontend/src/pages/LoginPage.tsx` with email and password fields, client-side validation (non-empty checks), submit handler calling `authApi.login`, success handler storing the token via `AuthContext` and redirecting to `/`, and inline error display for `401` responses
- [x] 8.2 Create `frontend/src/pages/LoginPage.module.css` with form layout styles
- [x] 8.3 Create `frontend/src/components/ProtectedRoute.tsx` that on mount calls `authApi.refreshToken()` if no in-memory token is present, stores the result via `AuthContext`, renders children if a token is available, and redirects to `/login` if the refresh fails
- [x] 8.4 Update `frontend/src/App.tsx` to add the `/login` route and wrap the `/` and `/candidates/new` routes with `ProtectedRoute`

## 9. Frontend – Tests

- [x] 9.1 Write unit tests for `authApi.ts`: `login` calls `POST /api/v1/auth/login` with the correct body; `refreshToken` calls `POST /api/v1/auth/refresh` with `credentials: 'include'`; `logout` calls `POST /api/v1/auth/logout`
- [x] 9.2 Write component tests for `LoginPage`: renders email and password fields; empty submit shows validation errors; successful login stores token and redirects; `401` response shows error message; submit button is disabled during loading
- [x] 9.3 Write component tests for `ProtectedRoute`: unauthenticated user (no token, refresh fails) is redirected to `/login`; user with valid in-memory token renders children; successful silent refresh renders children
- [x] 9.4 Update tests for `candidatesApi.ts`: token is read from `AuthContext` (not env var); on `401` response calls `refreshToken` and retries; on second `401` throws `ApiError(401)` without further retries
- [x] 9.5 Update the existing `CandidateForm` tests to ensure the `AuthContext` is provided (wrap renders with `AuthProvider` and pre-set a mock token)

## 10. Documentation

- [x] 10.1 Update `backend/README.md` with: required env variable `JWT_SECRET` (generation instructions), new auth endpoints, instructions for seeding the development user
- [x] 10.2 Update `frontend/README.md`: remove `REACT_APP_API_TOKEN`, document the login page URL and default development credentials
