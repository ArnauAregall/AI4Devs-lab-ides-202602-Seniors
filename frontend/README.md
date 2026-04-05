# LTI ATS — Frontend

Recruiter-facing web application for the LTI Applicant Tracking System.  
Built with React 18, TypeScript, and React Router v6.

---

## Prerequisites

- Node.js 18+
- npm 9+
- A running instance of the [backend API](../backend/README.md)

---

## Environment Variables

Create a `.env` file in this directory:


| Variable            | Description                       | Default                 |
| ------------------- | --------------------------------- | ----------------------- |
| `REACT_APP_API_URL` | Base URL for the backend REST API | `http://localhost:3010` |


> `REACT_APP_API_TOKEN` has been removed. Authentication is now handled through the login flow using short-lived JWTs and `HttpOnly` refresh cookies managed by the backend.

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Authentication

The application uses a credential-based login flow:

1. Navigate to any protected route — you will be redirected to `/login`.
2. Enter your email and password (default dev credentials: `recruiter@example.com` / `recruiter123`).
3. On successful login an access JWT is stored **in memory only** (never in `localStorage`).
4. The backend sets an `HttpOnly` refresh cookie so sessions are silently restored on page reload.
5. On logout or session expiry you are redirected back to `/login`.

### Authenticated navigation

When you are logged in, a **`NavBar`** appears at the top of every **protected** route (not on `/login`). It provides **Home** (`/`), **Profile** (`/profile`), and **Candidates** (`/candidates`) using React Router `NavLink`, with active-route highlighting and a `<nav aria-label="Main navigation">` landmark. On very narrow viewports the items scroll horizontally.

`/profile` and `/candidates` currently render minimal placeholder pages so those links always resolve; `/candidates/new` remains the add-candidate form.

### Change password

Authenticated users can open **`/settings`** to change their password. The form calls `PATCH /api/v1/auth/password` with the in-memory access token. Strength rules match the backend; after a successful change the refresh cookie is cleared on the server—remain logged in until the short-lived access token expires, then log in again with the new password.

---

## Running Tests

```bash
npm test
```

Tests use [Jest](https://jestjs.io/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).  
Test files live under `src/tests/`, mirroring the source structure.

---

## Building for Production

```bash
npm run build
```

The optimised output is written to `build/`.

---

## Folder Structure

```
src/
├── api/                 # API clients (authApi.ts, candidatesApi.ts) and shared types
├── auth/                # AuthContext – in-memory token store and AuthProvider
├── components/
│   ├── CandidateForm/   # Multi-section form for adding a candidate
│   ├── NavBar/          # Top nav (Home, Profile, Candidates) for authenticated users
│   └── ProtectedRoute   # Route guard that redirects unauthenticated users to /login
├── pages/               # Page-level components
├── tests/               # All tests (mirrors src/ structure)
│   ├── __mocks__/       # File stubs for Jest
│   ├── api/
│   ├── components/
│   ├── pages/
│   └── validation/
└── validation/          # Client-side validation logic
```

---

## Available Pages


| Path              | Description                          |
| ----------------- | ------------------------------------ |
| `/login`          | Login form (public)                  |
| `/`               | Recruiter dashboard (protected)    |
| `/candidates/new` | Add a new candidate form (protected) |
| `/candidates`     | Candidates hub — placeholder (protected) |
| `/profile`        | Profile — placeholder (protected)    |
| `/settings`       | Change password (protected)          |


