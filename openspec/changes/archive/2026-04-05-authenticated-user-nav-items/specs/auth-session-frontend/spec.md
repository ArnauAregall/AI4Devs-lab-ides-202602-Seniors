## MODIFIED Requirements

### Requirement: Protected routes redirect unauthenticated users to the login page
The frontend SHALL wrap all routes other than `/login` with a `ProtectedRoute` guard that checks for a valid in-memory access token (or attempts a silent refresh) before rendering the child route; unauthenticated users SHALL be redirected to `/login`. Protected routes SHALL be rendered inside an authenticated layout that includes the `NavBar` component above the page content, so navigation is consistently available to authenticated users on every protected page.

#### Scenario: Unauthenticated access to dashboard redirects to login
- **WHEN** a user navigates to `/` without a valid in-memory token and the silent refresh also fails
- **THEN** the user SHALL be redirected to `/login`

#### Scenario: Unauthenticated access to add-candidate form redirects to login
- **WHEN** a user navigates to `/candidates/new` without a valid in-memory token and the silent refresh also fails
- **THEN** the user SHALL be redirected to `/login`

#### Scenario: Authenticated user can access protected routes
- **WHEN** a user navigates to a protected route with a valid in-memory access token
- **THEN** the route SHALL render normally without a redirect

#### Scenario: Authenticated user sees the NavBar on every protected page
- **WHEN** a user is authenticated and navigates to any protected route (e.g. `/`, `/candidates`, `/profile`)
- **THEN** the `NavBar` SHALL be visible at the top of the page above the page content
