## 1. Placeholder Pages

- [x] 1.1 Create `frontend/src/pages/ProfilePage.tsx` as a minimal placeholder page (heading + "coming soon" text) using CSS module pattern matching existing pages
- [x] 1.2 Create `frontend/src/pages/ProfilePage.module.css` with basic page layout styles consistent with DashboardPage
- [x] 1.3 Create `frontend/src/pages/CandidatesPage.tsx` as a minimal placeholder page (heading + "coming soon" text)
- [x] 1.4 Create `frontend/src/pages/CandidatesPage.module.css` with basic page layout styles

## 2. NavBar Component

- [x] 2.1 Create `frontend/src/components/NavBar/NavBar.tsx` using React Router `NavLink` for each of the three links (Home `/`, Profile `/profile`, Candidates `/candidates`)
- [x] 2.2 Wrap the links in a `<nav aria-label="Main navigation">` landmark element
- [x] 2.3 Create `frontend/src/components/NavBar/NavBar.module.css` with styles for the nav bar, nav links, and an `.active` class that visually distinguishes the active route (bottom border + bold weight using `#4f46e5`)
- [x] 2.4 Add responsive styles in `NavBar.module.css` so nav items scroll horizontally on viewports narrower than 480 px
- [x] 2.5 Add focus-visible styles for keyboard navigation (outline using `#a5b4fc` consistent with existing button focus styles)

## 3. App Routing Integration

- [x] 3.1 Register `/profile` as a protected route in `App.tsx` rendering `ProfilePage`
- [x] 3.2 Register `/candidates` as a protected route in `App.tsx` rendering `CandidatesPage`
- [x] 3.3 Wrap all `ProtectedRoute` children in `App.tsx` with a layout element that renders `NavBar` above the page content (e.g. an `AuthenticatedLayout` fragment or wrapper div)

## 4. Tests

- [x] 4.1 Create `frontend/src/tests/components/NavBar.test.tsx` that verifies: NavBar renders all three links, `<nav>` has `aria-label="Main navigation"`, NavBar is not rendered on the login page
- [x] 4.2 Add a test scenario to `NavBar.test.tsx` that verifies the active link receives the active CSS class when the corresponding route is active
- [x] 4.3 Update `frontend/src/tests/App.test.tsx` if needed to account for the new routes and NavBar presence on protected pages
