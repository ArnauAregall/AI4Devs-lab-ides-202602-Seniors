## Why

Recruiters currently have no UI to add candidates to the ATS — the backend API (`POST /api/v1/candidates`) exists but is only callable programmatically. Without a recruiter-facing form, the system cannot fulfil its primary function of capturing candidate profiles and CVs, which blocks the complete hire-to-onboard workflow from starting.

## What Changes

- Add a minimal recruiter dashboard (`/`) that includes a prominent "Add Candidate" button as the primary call-to-action.
- Introduce a dedicated "Add Candidate" page (`/candidates/new`) with a structured multi-section form:
  - Candidate details (first name, last name, email, phone, address).
  - Education history (dynamic rows: add/remove).
  - Work experience (dynamic rows: add/remove).
  - Additional details (source, notes).
  - CV upload (PDF or DOCX, up to 5 MB).
- Implement client-side validation (required fields, email format, file type/size) with inline per-field errors.
- Integrate with `POST /api/v1/candidates` using `multipart/form-data` for combined profile and CV submission.
- Show a loading indicator during submission and a success confirmation ("Candidate 'First Last' has been added.") on completion.
- Map backend validation errors (per-field `fieldErrors`) and generic 5xx errors to user-friendly UI messages.
- Add React Router for client-side navigation between dashboard and the add-candidate page.
- Create a typed API client module (`src/api/candidatesApi.ts`) for candidate creation and retrieval.

## Capabilities

### New Capabilities
- `add-candidate-form`: The complete recruiter workflow for adding a new candidate — dashboard entry point, multi-section form, client-side validation, CV file upload, API submission, loading/success/error feedback, and accessibility baseline.
- `candidate-api-client`: Typed frontend API client for `POST /api/v1/candidates` and `GET /api/v1/candidates/{id}`, including request/response type definitions, error parsing, and multipart encoding.

### Modified Capabilities

## Impact

- **Frontend `src/`**: New pages (`DashboardPage`, `AddCandidatePage`), form components (`CandidateForm`, `EducationFieldset`, `WorkExperienceFieldset`, `CvUploadField`), API client module, and client-side validation helpers.
- **`App.tsx`**: Updated to mount React Router and define routes (`/` → dashboard, `/candidates/new` → form).
- **`package.json`**: New dependencies — `react-router-dom` for routing; no heavy form or UI library added to keep bundle lean (native HTML form + CSS modules or plain CSS).
- **`frontend/.env`**: `REACT_APP_API_URL` environment variable added to configure the backend base URL.
- **Tests**: React Testing Library component tests for form validation, dynamic field behaviour, and submission states; mocked API calls for integration paths.
