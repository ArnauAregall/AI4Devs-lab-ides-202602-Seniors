## Context

The app is a React SPA using React Router v6 with CSS Modules. Authentication state lives in `AuthContext` (in-memory access token). Protected routes are wrapped with `ProtectedRoute`. Currently there is no persistent navigation component—users navigate via hard-coded buttons or URL entry. The existing UI palette is indigo (`#4f46e5`) on white, with dark headings (`#1a1a2e`).

## Goals / Non-Goals

**Goals:**

- Introduce a `NavBar` component that renders only when the user is authenticated.
- Include exactly three nav items: Home (`/`), Profile (`/profile`), Candidates (`/candidates`).
- Visually distinguish the active route using React Router's `NavLink` with an active CSS class.
- Meet WCAG 2.1 AA accessibility requirements: `<nav>` with `aria-label`, focus-visible styles.
- Be responsive: items collapse to a horizontally scrollable row on small viewports.
- Add minimal `ProfilePage` and `CandidatesPage` placeholder components so the routes resolve.
- Integrate into the authenticated layout without touching `ProtectedRoute` logic.

**Non-Goals:**

- No mobile hamburger menu (deferred).
- No logout button in this change (separate concern).
- No real profile or candidates list UI (placeholders only for new pages).
- No backend changes.

## Decisions

### 1. Use React Router `NavLink` instead of plain `<a>`

`NavLink` automatically applies an `isActive` state that can be used to apply a CSS class. This avoids manual `useLocation` comparison and keeps active-state logic declarative.

*Alternative considered*: `useLocation` + conditional class. Rejected — more boilerplate, harder to maintain.

### 2. Render `NavBar` as a layout wrapper in `App.tsx`

A thin `AuthenticatedLayout` wrapper (or inline in `App.tsx`) wraps all `ProtectedRoute` routes with `NavBar` at the top, so the nav appears consistently on every authenticated page.

*Alternative considered*: Include `NavBar` inside each page component. Rejected — duplicates markup and risks inconsistency.

### 3. CSS Module for `NavBar` using existing design tokens

Keeps the styling pattern consistent with all other components. Active link uses an `active` CSS class with a bottom border (`#4f46e5`) and bold weight.

*Alternative considered*: Inline styles or Tailwind. Rejected — project uses CSS Modules exclusively.

### 4. Two new placeholder pages (ProfilePage, CandidatesPage)

A `NavLink` to a missing route would 404. Adding minimal placeholder pages ensures the links work end-to-end and tests can assert navigation.

## Risks / Trade-offs

- [Adding `/profile` and `/candidates` routes] New routes are placeholders with no real content, which may confuse stakeholders if reviewed before full implementation. → Mitigation: Mark pages clearly as "coming soon" in the placeholder text.
- [NavBar couples to `AuthContext`] If auth mechanism changes, `NavBar` must be updated too. → Mitigation: `NavBar` only reads `accessToken` existence via `useAuth`; it doesn't call any auth API directly, limiting the blast radius.
