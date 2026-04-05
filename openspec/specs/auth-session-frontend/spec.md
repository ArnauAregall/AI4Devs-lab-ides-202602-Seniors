## ADDED Requirements

### Requirement: Application provides a login page with email and password fields
The frontend SHALL provide a `/login` route that renders a form with an email field, a password field, a submit button, and an inline error area. The form SHALL call `POST /api/v1/auth/login` on submission.

#### Scenario: Login page renders all required fields
- **WHEN** a user navigates to `/login`
- **THEN** the page SHALL display an email input, a password input, and a submit button

#### Scenario: Empty form submission shows inline validation errors
- **WHEN** the login form is submitted with empty email or password fields
- **THEN** the form SHALL NOT call the API and SHALL display an inline error message next to each empty required field

#### Scenario: Successful login redirects to the dashboard
- **WHEN** the login form is submitted with valid credentials and the API returns `200`
- **THEN** the access token SHALL be stored in memory and the user SHALL be redirected to `/`

#### Scenario: Failed login shows server error message
- **WHEN** the API returns `401` in response to the login form submission
- **THEN** the form SHALL display a non-technical error message (e.g. "Invalid email or password.") and SHALL NOT redirect

#### Scenario: Login form is disabled during submission
- **WHEN** the login form has been submitted and the API request is in progress
- **THEN** the submit button SHALL be disabled and SHALL indicate loading

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

### Requirement: Access token is stored in memory only and restored silently on page load
The frontend SHALL store the access JWT in a JavaScript module-level variable or React context. The token SHALL NOT be written to `localStorage`, `sessionStorage`, or any JavaScript-accessible cookie. On application load, the frontend SHALL attempt to restore the access token by calling `POST /api/v1/auth/refresh` using the `HttpOnly` cookie before rendering protected content.

#### Scenario: Access token is not present in localStorage or sessionStorage
- **WHEN** a user is logged in and the browser storage is inspected
- **THEN** no JWT value SHALL be found in `localStorage` or `sessionStorage`

#### Scenario: Access token is restored silently after page reload
- **WHEN** a logged-in user reloads the page
- **THEN** the application SHALL call `POST /api/v1/auth/refresh` during initialisation, store the new access token in memory, and render the requested protected route without showing the login page

#### Scenario: Silent restore fails and redirects to login
- **WHEN** a user reloads the page and the refresh call returns `401` (expired or absent cookie)
- **THEN** the application SHALL redirect the user to `/login`

### Requirement: API client attaches the in-memory access token to every request
The `candidatesApi.ts` API client SHALL read the access token from the in-memory auth store and attach it as an `Authorization: Bearer <token>` header on every outgoing request. It SHALL NOT read `REACT_APP_API_TOKEN`.

#### Scenario: API request includes Authorization header
- **WHEN** any function in `candidatesApi.ts` is called while a valid in-memory token exists
- **THEN** the outgoing HTTP request SHALL include the header `Authorization: Bearer <token>`

### Requirement: API client performs a single silent token refresh on 401 responses
When any API call returns `401 Unauthorized`, the API client SHALL call `POST /api/v1/auth/refresh` once. If the refresh succeeds, the original request SHALL be retried with the new token. If the refresh also fails, the client SHALL propagate an `ApiError` with `status: 401` and the calling component SHALL redirect to `/login`.

#### Scenario: 401 triggers one refresh and retries the original request
- **WHEN** a candidate API call returns `401` and the subsequent refresh call returns a new access token
- **THEN** the original request SHALL be retried with the new token and the caller SHALL receive the successful result

#### Scenario: Failed refresh after 401 propagates ApiError
- **WHEN** a candidate API call returns `401` and the subsequent refresh call also returns `401`
- **THEN** the client SHALL throw an `ApiError` with `status: 401` and SHALL NOT attempt further retries
