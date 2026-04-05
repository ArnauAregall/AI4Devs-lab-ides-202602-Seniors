## Context

The application already has a full JWT-based authentication stack: `POST /api/v1/auth/login` issues an access token and a `HttpOnly` refresh cookie; a `ProtectedRoute` guard wraps all non-login routes; and an API client that auto-refreshes on `401`. Passwords are stored as bcrypt hashes with cost factor ≥ 12.

Users currently have no self-service way to change their password. The change adds a `PATCH /api/v1/auth/password` endpoint behind the existing `authenticate` middleware and a frontend form reachable from a settings/account area.

## Goals / Non-Goals

**Goals:**
- Allow an authenticated user to change their own password via a three-field form.
- Server-side: verify current password, enforce strength rules, hash and persist the new password.
- Client-side: mirror all validations with inline, field-level error messages; preserve non-sensitive input on failure.
- Optionally invalidate other active sessions after a successful change.

**Non-Goals:**
- Password reset / forgot-password flow (unauthenticated).
- Admin-initiated password changes.
- Multi-factor authentication or re-authentication beyond current-password verification.
- Email notifications on password change (out of scope for now).

## Decisions

### D1 — Endpoint method and path: `PATCH /api/v1/auth/password`

`PATCH` signals a partial update of the auth resource. Keeping it under `/api/v1/auth/` is consistent with the existing auth surface and avoids a separate `/users/me/password` path that would require understanding the user-resource hierarchy.

Alternatives considered: `PUT /api/v1/users/me/password` — rejected because the user-management API surface is separate from the auth surface, and we already have an `authenticate` middleware that the auth router applies.

### D2 — Authentication: reuse existing `authenticate` middleware

The endpoint sits behind the same `authenticate` JWT middleware used by all other protected routes. No additional auth layer (e.g., session re-confirmation) is introduced. The current-password field fulfils the "prove you know the secret" requirement without a separate challenge flow.

### D3 — Validation split: domain-layer rules, controller-layer request shape

Password strength rules (min 8 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char) live in the domain/application layer so they can be unit-tested independently. Request-shape validation (field presence, type) is handled in the controller/route using the existing validation pattern.

### D4 — Session invalidation: refresh-token cookie cleared on success

After a successful password change the server clears the `refreshToken` cookie for the current session (same `Set-Cookie: refreshToken=; Max-Age=0` pattern as logout). This forces re-authentication on next token expiry. Full invalidation of _all_ other sessions is deferred: the current JWT implementation is stateless and does not maintain a token blocklist. The cookie-clear approach is a pragmatic compromise that does not require new infrastructure.

### D5 — Frontend: new `ChangePasswordForm` component in a Settings page or modal

The form is a standalone component rendered at `/settings` (or a sub-route). It reads no route parameters and calls only the change-password API client method. All three fields are controlled inputs; only the password fields are cleared on error (the user should not retype their current password unnecessarily — but per requirement, non-sensitive fields are preserved, so only current-password is cleared on "incorrect current password" errors).

### D6 — Error display: field-level, inline, no page reload

Each validation error maps to a specific field. The component keeps `fieldErrors: Record<string, string>` state. On submission failure the form repopulates with values already typed (except cleared sensitive fields) and renders errors beneath the relevant input, matching the pattern used in the login form.

## Risks / Trade-offs

- **Stateless JWT means other sessions aren't truly invalidated** → Mitigated by clearing the refresh cookie for the current request; full blocklist can be added in a follow-up.
- **bcrypt compare is CPU-bound and blocking** → Mitigated by using `bcrypt.compare` (async, offloaded to thread pool), same as the login endpoint.
- **Parallel requests during the brief window between verify and update could cause race conditions** → Risk is negligible at current scale; a database-level update with a `WHERE hashedPassword = <old>` check is not necessary with the current ORM pattern.
- **Client-side strength validation can be bypassed** → Mitigated by server-side enforcement; client-side rules are a UX aid only.

## Migration Plan

1. Deploy backend route and service method — no schema migration needed (same `hashedPassword` column).
2. Deploy frontend form — gated by `ProtectedRoute`, so no risk to unauthenticated users.
3. No rollback complexity: removing the route and component restores prior state with no data migration.

## Open Questions

- Should the settings page be a dedicated route (`/settings`) or a modal accessible from a header dropdown? (Recommend dedicated route for accessibility and shareability, but UI placement can be decided during implementation.)
- Should the API return a new access token after the password change so the user stays logged in, or force a full re-login? (Current design: user stays logged in via existing in-memory token until expiry; refresh cookie is cleared so next refresh requires login.)
