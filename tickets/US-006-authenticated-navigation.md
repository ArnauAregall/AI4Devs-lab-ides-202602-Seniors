## User Story: Frontend – Authenticated Navigation (NavBar)

**ID**: US-006

**As a** logged-in recruiter,  
**I want** a persistent top navigation bar on every protected screen,  
**so that** I can move between Home, Profile, and Candidates without typing URLs or relying on one-off buttons.

---

### Background & Motivation

US-004 introduced protected routes and US-003/US-005 added dashboard, add-candidate, and settings flows, but there was no shared navigation shell. This story adds an **`NavBar`** (Home, Profile, Candidates) visible only when authenticated, integrated via an **`AuthenticatedLayout`** wrapper in `App.tsx`, plus minimal placeholder pages so every nav target resolves.

**Source specification**: OpenSpec change archived at `openspec/changes/archive/2026-04-05-authenticated-user-nav-items/` (proposal, design, tasks, delta specs). Merged **canonical** requirements live under `openspec/specs/`: **`authenticated-nav`** and updates to **`auth-session-frontend`** (NavBar in the authenticated layout).

---

### Functional Scope

#### In scope

**Frontend**

- **`NavBar`** (`frontend/src/components/NavBar/`) with exactly three **`NavLink`** items:
  - **Home** → `/`
  - **Profile** → `/profile`
  - **Candidates** → `/candidates`
- Rendered only inside the authenticated shell (not on `/login`).
- **Active route** styling via `NavLink` active class (e.g. bottom border + bold, indigo `#4f46e5`).
- **Accessibility**: `<nav aria-label="Main navigation">`, focus-visible styles, keyboard-operable anchors.
- **Responsive**: horizontal scroll on narrow viewports (&lt; 480 px), no hamburger menu in this iteration.
- **Placeholder pages**: `ProfilePage` at `/profile`, `CandidatesPage` at `/candidates` (“coming soon” style) so links do not 404.
- **Tests**: `NavBar.test.tsx` (links, landmark, login exclusion, active class); `App.test.tsx` updated if needed.

#### Out of scope

- Mobile hamburger menu.
- Logout control in the nav (separate story).
- Real profile or candidate list UI (placeholders only).
- Backend or API changes.

---

### Routing Summary

| Path              | Protection | Notes                                      |
| ----------------- | ---------- | ------------------------------------------ |
| `/login`          | Public     | No NavBar                                  |
| `/`               | Protected  | Dashboard; NavBar visible                  |
| `/candidates/new` | Protected  | Add candidate form; NavBar visible         |
| `/settings`       | Protected  | Change password; NavBar visible              |
| `/profile`        | Protected  | Placeholder; NavBar visible                |
| `/candidates`     | Protected  | Placeholder; NavBar visible                |

---

### Non-Functional Requirements

- Styling via **CSS Modules** consistent with the existing indigo palette.
- No new runtime dependencies beyond React Router patterns already in use.

---

### Testing Requirements

- Component tests assert three links, `aria-label="Main navigation"`, NavBar absent on login route, and active class on the current route.
- Placeholder routes render without error for authenticated users.

---

### Definition of Done

- `NavBar` and `AuthenticatedLayout` integrated in `App.tsx`; all protected routes show the bar; `/login` does not.
- `/profile` and `/candidates` registered and render placeholders.
- `frontend/README.md` and architecture docs describe navigation and routes.
- Requirements reflected in `openspec/specs/authenticated-nav` and `auth-session-frontend`; archive at `openspec/changes/archive/2026-04-05-authenticated-user-nav-items/`.
- Relevant frontend tests pass.
