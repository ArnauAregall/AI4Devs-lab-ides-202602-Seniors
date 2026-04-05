## 1. Backend — Validation

- [x] 1.1 Add `changePasswordSchema` to `backend/src/application/validators/authValidator.ts` validating `currentPassword`, `newPassword`, and `confirmNewPassword` presence
- [x] 1.2 Add password-strength validation helper in `authValidator.ts` that checks min 8 chars, uppercase, lowercase, digit, and special character, returning a distinct error message per unmet rule
- [x] 1.3 Add unit tests for the new password-strength validation rules in `authValidator.ts`

## 2. Backend — Domain / Application Service

- [x] 2.1 Add `changePassword(userId, currentPassword, newPassword)` method to `backend/src/application/services/authService.ts` that: fetches user by ID, compares `currentPassword` with bcrypt, validates strength rules, hashes `newPassword` with bcrypt cost 12, and updates the user record via the repository
- [x] 2.2 Return a domain error (e.g., existing `InvalidCredentialsError` or a new `PasswordValidationError`) when current password does not match, and strength-rule errors when the new password is weak
- [x] 2.3 Add unit tests for `changePassword` in `backend/src/application/services/authService.test.ts` covering: incorrect current password, each strength-rule failure, mismatched passwords, and successful update

## 3. Backend — Controller & Route

- [x] 3.1 Add `changePassword` handler to `backend/src/presentation/controllers/authController.ts` that calls `changePasswordSchema` for request validation and invokes `authService.changePassword`, mapping domain errors to `400` field errors
- [x] 3.2 On success, clear the `refreshToken` cookie (`Max-Age=0`) in the response and return `200 { success: true, message: "Your password has been changed successfully." }`
- [x] 3.3 Register `PATCH /password` on the auth router in `backend/src/routes/authRoutes.ts` behind the `authenticate` middleware
- [x] 3.4 Add controller integration tests to `backend/src/presentation/controllers/authController.test.ts` for the change-password handler covering auth guard, field errors, and success

## 4. Frontend — API Client

- [x] 4.1 Add `changePassword(currentPassword, newPassword, confirmNewPassword)` function to `frontend/src/api/authApi.ts` that calls `PATCH /api/v1/auth/password` with the access token and returns the response or throws an `ApiError`

## 5. Frontend — Validation

- [x] 5.1 Add `validateChangePasswordForm` to `frontend/src/validation/` (new file `changePasswordValidation.ts`) with client-side rules matching the backend: required fields, strength rules, and confirmation match

## 6. Frontend — Component

- [x] 6.1 Create `frontend/src/pages/ChangePasswordPage.tsx` with a form containing three controlled `<input type="password">` fields and a submit button
- [x] 6.2 Add CSS module `frontend/src/pages/ChangePasswordPage.module.css` with basic form styles consistent with `LoginPage.module.css`
- [x] 6.3 Implement form state: `fieldValues` (currentPassword, newPassword, confirmNewPassword), `fieldErrors`, `isLoading`, and `successMessage`
- [x] 6.4 On submit: run client-side validation; if errors exist, display them inline and return early without calling the API
- [x] 6.5 On submit (valid): call `changePassword` from `authApi.ts`, set `isLoading=true`, disable the submit button, and handle the response
- [x] 6.6 On `200`: display "Your password has been changed successfully." inline and clear all three password fields
- [x] 6.7 On `400` API error: map `fieldErrors` from the response to the form state; clear all three password fields; display each error beneath its corresponding field

## 7. Frontend — Routing

- [x] 7.1 Add a `ProtectedRoute`-wrapped `/settings` route to `frontend/src/App.tsx` (or routing config) that renders `ChangePasswordPage`
- [x] 7.2 Verify that navigating to `/settings` without a valid session redirects to `/login`

## 8. Frontend — Tests

- [x] 8.1 Add unit tests for `validateChangePasswordForm` in `frontend/src/tests/` covering: empty fields, each strength-rule failure, mismatched passwords, and all-valid input
- [x] 8.2 Add component tests for `ChangePasswordPage` covering: rendering all fields, client-side error display, loading state during submission, success message, and server-error inline display
