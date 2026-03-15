## Context

The frontend is a bare Create React App scaffold (React 18, TypeScript 4.9.5, React Testing Library, no routing, no form library, no UI library). The backend `POST /api/v1/candidates` endpoint is fully implemented (US-001), accepts `multipart/form-data` or JSON, requires a Bearer JWT, and returns structured validation error responses. The schema also defines a `GET /api/v1/candidates/{id}` endpoint for retrieving candidate details.

The app currently renders a default CRA placeholder. This change introduces the first real screens and all frontend infrastructure (routing, API client, form components, validation).

## Goals / Non-Goals

**Goals:**

- Introduce React Router for client-side navigation with two routes: `/` (dashboard) and `/candidates/new` (add candidate form).
- Build a multi-section add-candidate form covering all fields defined in US-003.
- Implement client-side validation that mirrors backend validation rules.
- Implement a typed API client module for candidate creation (multipart) and retrieval.
- Map backend error responses (field-level and generic) to UI messages.
- Meet the accessibility baseline: labelled inputs, keyboard navigation, focus management on success/error.
- Ship React Testing Library tests for all meaningful form states.

**Non-Goals:**

- Candidate list view or search/filter — out of scope for this story.
- Authentication UI (login/logout flows) — the JWT token is assumed to already exist in the client environment; a hardcoded dev token in `.env` is acceptable for this iteration.
- Edit/delete candidate — out of scope.
- Storybook or design-system-level component documentation — out of scope.
- Mobile-first responsive design — basic desktop-first layout is sufficient; tablet usability is a nice-to-have.
- Global state management library (Redux, Zustand) — `useState` / `useReducer` in components is sufficient for a single form with no cross-route state sharing.

## Decisions

### Decision 1: React Router DOM for routing

**Chosen**: Add `react-router-dom` (v6) as the only new production dependency.

**Rationale**: The app needs client-side navigation (dashboard → form) and a clean URL story (`/candidates/new`). React Router v6 is the standard for React SPAs, is well-tested, and integrates cleanly with CRA. No other routing solution is justified at this scale.

**Alternatives considered**: Single-page component switching with conditional rendering — rejected because it produces non-bookmarkable URLs and hides navigation intent.

---

### Decision 2: No dedicated form library (react-hook-form, Formik)

**Chosen**: Manage form state with `useState` / `useReducer` and validate via a hand-written validation module (`src/validation/candidateValidation.ts`).

**Rationale**: The form has well-defined fields with straightforward rules that mirror what Zod already enforces on the backend. Adding react-hook-form or Formik would add bundle weight, API surface, and a new abstraction layer that a future engineer must learn — none of which is justified for a single form. TypeScript types + a thin validation module achieves the same result with zero new dependencies.

**Alternatives considered**: `react-hook-form` — fast and lightweight, but even its minimal bundle is unnecessary here. Deferred to a later iteration if the form count grows.

---

### Decision 3: Multipart form-data submission for combined profile + CV

**Chosen**: When a CV file is selected, submit the form as `multipart/form-data` with candidate fields serialised as individual form fields alongside the `cvFile` part. When no CV, submit as `application/json`.

**Rationale**: The backend `POST /api/v1/candidates` already handles both content types. Multipart is the natural encoding for mixed text+binary payloads. It avoids base64 overhead of embedding binary in JSON.

**Alternatives considered**: Always submit JSON and call `POST /api/v1/candidates/{id}/cv` afterwards — adds a second request, increases failure surface (what if the CV upload fails after a successful create?). Not justified.

---

### Decision 4: API client as a plain async module, not a React Query / SWR hook

**Chosen**: `src/api/candidatesApi.ts` exports plain `async` functions (`createCandidate`, `getCandidateById`). Components call these functions directly, manage loading/error state locally with `useState`.

**Rationale**: There is only one mutation (create) and at most one read in this story. Introducing React Query or SWR for a single mutation adds 10-40 KB and a learning curve with no cache benefit at this scale. The component-local state is simple and clearly testable with mocks.

**Alternatives considered**: React Query — appropriate if we had a list view with caching needs. Deferred.

---

### Decision 5: CSS Modules for component-scoped styling

**Chosen**: Each component gets a co-located `.module.css` file. No CSS-in-JS, no Tailwind, no external component library.

**Rationale**: The project has no established design system or UI library. CSS Modules are built into CRA, require no extra dependencies, are locally scoped, and produce readable class names in development. They are easy to replace later with a design system.

**Alternatives considered**: Styled Components / Emotion — adds runtime overhead; MUI / Ant Design — adds substantial bundle weight for a single form.

---

### Decision 6: JWT via environment variable for this iteration

**Chosen**: The API client reads `REACT_APP_API_TOKEN` from the environment to attach the `Authorization: Bearer` header. In local development this is set in `.env.local`. The real auth flow is deferred.

**Rationale**: US-003 does not include a login screen. The backend requires a JWT. Using an env var is the simplest integration path that keeps the client secure without implementing auth.

## Risks / Trade-offs

- **No auth UI**: The app assumes a valid JWT is in the environment. Any recruiter testing the app locally needs to obtain and paste in a token manually. → Mitigation: Document the setup in `frontend/README.md`.
- **Dynamic rows with `useState` arrays**: Adding/removing education and work experience rows using array index-based state is straightforward but requires careful handling of deletions (splice, not just nulling). → Mitigation: Always derive a fresh array on add/remove; never mutate state in-place.
- **File input accessibility**: `<input type="file">` styling and accessibility are notoriously browser-inconsistent. → Mitigation: Keep the native input visible (styled but not hidden), add explicit label, and test keyboard access.
- **Multipart encoding of nested arrays**: Education and work experience are arrays of objects; `FormData` does not natively support nested objects. → Mitigation: Append each sub-field with an indexed key convention (`education[0][degree]`, etc.) or fall back to a JSON body field if the backend supports it. The current backend accepts JSON body for non-CV requests — so the strategy is: if CV present → multipart with JSON-serialised education/workExperience fields; if no CV → plain JSON.

## Open Questions

- Should a successful create navigate automatically to `GET /api/v1/candidates/{id}` and display a read-only candidate detail view, or just show an inline success banner and reset the form? US-003 says "optionally redirect to candidate detail view" — for this iteration, show a success banner and offer a "View candidate" link that would navigate to a (stubbed) detail page.
- Is there a design mockup or color palette to follow? Not yet — the design will use a neutral, accessible palette with the project's existing brand colors if any are defined in CSS variables.

