## Why

The application has protected routes and authenticated users but no persistent navigation between them. Users must rely on direct URL entry or buttons scattered across pages to move around the app, creating a disjointed experience.

## What Changes

- Introduce a `NavBar` component rendered only when the user is authenticated, providing links to Home (`/`), Profile (`/profile`), and Candidates (`/candidates`).
- The active route must be visually distinguished from inactive routes.
- Nav items must be accessible with appropriate aria attributes and semantic HTML.
- The navigation must be responsive and consistent with the existing CSS-module-based UI design system (indigo/purple `#4f46e5` palette).
- Add a `/profile` route (ProfilePage) as a placeholder to satisfy the Profile nav link.
- Add a `/candidates` route (CandidatesPage) as a placeholder to satisfy the Candidates nav link.

## Capabilities

### New Capabilities

- `authenticated-nav`: A persistent top navigation bar visible only to authenticated users, containing Home, Profile, and Candidates nav items with active-route highlighting, ARIA attributes, and responsive layout.

### Modified Capabilities

- `auth-session-frontend`: The protected-route shell layout is extended to include the new `NavBar` component above page content.

## Impact

- New `NavBar` component in `frontend/src/components/NavBar/`.
- New `ProfilePage` placeholder at `frontend/src/pages/ProfilePage.tsx` (route `/profile`).
- New `CandidatesPage` placeholder at `frontend/src/pages/CandidatesPage.tsx` (route `/candidates`).
- `App.tsx` updated to register the two new routes and render `NavBar` inside the authenticated layout.
- No API or backend changes required.
- No breaking changes.
