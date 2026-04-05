## ADDED Requirements

### Requirement: NavBar renders exactly three navigation items for authenticated users
The frontend SHALL render a `NavBar` component containing exactly three navigable links—Home (`/`), Profile (`/profile`), and Candidates (`/candidates`)—whenever the user is authenticated. The `NavBar` SHALL NOT be visible on the `/login` route or any unauthenticated page.

#### Scenario: Authenticated user sees all three nav items
- **WHEN** a user is authenticated and navigates to any protected route
- **THEN** the `NavBar` SHALL display exactly three links: "Home", "Profile", and "Candidates"

#### Scenario: Unauthenticated user does not see the NavBar
- **WHEN** a user visits `/login` or any route while unauthenticated
- **THEN** the `NavBar` SHALL NOT be rendered on the page

### Requirement: Each nav item links to the correct route
The Home nav item SHALL link to `/`, the Profile nav item SHALL link to `/profile`, and the Candidates nav item SHALL link to `/candidates`.

#### Scenario: Home link points to the root route
- **WHEN** the user clicks the "Home" nav item
- **THEN** the application SHALL navigate to `/`

#### Scenario: Profile link points to the profile route
- **WHEN** the user clicks the "Profile" nav item
- **THEN** the application SHALL navigate to `/profile`

#### Scenario: Candidates link points to the candidates route
- **WHEN** the user clicks the "Candidates" nav item
- **THEN** the application SHALL navigate to `/candidates`

### Requirement: Active route is visually distinguished
The `NavBar` SHALL apply a distinct visual style (e.g., different color, underline, or bold weight) to the nav item whose `href` matches the current URL pathname, so users can identify their current location at a glance.

#### Scenario: Current route nav item is visually active
- **WHEN** the user is on the `/` route
- **THEN** the "Home" nav item SHALL have the active style applied and the other items SHALL NOT

#### Scenario: Active style updates on navigation
- **WHEN** the user navigates from `/` to `/candidates`
- **THEN** the "Candidates" nav item SHALL gain the active style and "Home" SHALL lose it

### Requirement: NavBar uses semantic HTML and ARIA attributes for accessibility
The `NavBar` SHALL be wrapped in a `<nav>` element with an `aria-label="Main navigation"` attribute. Each nav item SHALL be an anchor element (`<a>` or `NavLink` rendered as `<a>`) so keyboard and assistive-technology users can navigate the list of links.

#### Scenario: NavBar uses a nav landmark
- **WHEN** the NavBar is rendered
- **THEN** it SHALL contain a `<nav>` element with `aria-label="Main navigation"`

#### Scenario: Each nav item is a focusable anchor
- **WHEN** a keyboard user tabs through the NavBar
- **THEN** each of the three nav items SHALL receive focus in order and SHALL be operable via the Enter key

### Requirement: NavBar is responsive on small viewports
The `NavBar` SHALL remain usable on viewports narrower than 480 px by allowing the nav items to scroll horizontally or wrap, without hiding or obscuring content behind a hamburger menu.

#### Scenario: Nav items are accessible on a narrow viewport
- **WHEN** the browser viewport width is 360 px
- **THEN** all three nav items SHALL be visible or reachable by horizontal scrolling without any items being clipped out of the scrollable area

### Requirement: Profile and Candidates routes resolve to placeholder pages
The application SHALL register `/profile` and `/candidates` as protected routes, each rendering a minimal placeholder page (e.g., "Page coming soon") so that the corresponding NavBar links resolve without errors.

#### Scenario: Profile route renders a placeholder
- **WHEN** an authenticated user navigates to `/profile`
- **THEN** the page SHALL render without errors and SHALL display placeholder content indicating the page is under construction

#### Scenario: Candidates route renders a placeholder
- **WHEN** an authenticated user navigates to `/candidates`
- **THEN** the page SHALL render without errors and SHALL display placeholder content indicating the page is under construction
