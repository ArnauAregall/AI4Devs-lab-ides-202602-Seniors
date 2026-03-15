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

Create a `.env` file in this directory (a template is provided as `.env`):

| Variable              | Description                              | Default                        |
|-----------------------|------------------------------------------|--------------------------------|
| `REACT_APP_API_URL`   | Base URL for the backend REST API        | `http://localhost:3010`        |
| `REACT_APP_API_TOKEN` | Bearer token for API authentication      | `change-me-in-dev`             |

> **Note:** These values are embedded at build time by Create React App. Never commit real tokens to source control.

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
├── api/                 # API client (candidatesApi.ts) and shared types (types.ts)
├── components/
│   └── CandidateForm/   # Multi-section form for adding a candidate
├── pages/               # Page-level components (DashboardPage, AddCandidatePage)
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

| Path               | Description                        |
|--------------------|------------------------------------|
| `/`                | Recruiter dashboard                |
| `/candidates/new`  | Add a new candidate form           |
