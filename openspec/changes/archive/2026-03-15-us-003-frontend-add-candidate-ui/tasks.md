## 1. Project Setup

- [x] 1.1 Install `react-router-dom` (v6) and `@types/react-router-dom` in `frontend/package.json`
- [x] 1.2 Create `frontend/.env` with `REACT_APP_API_URL=http://localhost:3010` and `REACT_APP_API_TOKEN=<dev-token>` and document setup in `frontend/README.md`
- [x] 1.3 Update `frontend/src/index.tsx` to wrap `<App>` with `<BrowserRouter>` from react-router-dom
- [x] 1.4 Update `frontend/src/App.tsx` to define routes: `/` → `DashboardPage`, `/candidates/new` → `AddCandidatePage`

## 2. API Client

- [x] 2.1 Create `frontend/src/api/types.ts` with TypeScript interfaces: `CreateCandidateRequest`, `CandidateResponse`, `CvMetadata`, `ApiError`, and `ApiErrorResponse`
- [x] 2.2 Create `frontend/src/api/candidatesApi.ts` with `createCandidate` and `getCandidateById` functions; read base URL from `REACT_APP_API_URL` and Bearer token from `REACT_APP_API_TOKEN`; throw typed `ApiError` on non-2xx responses
- [x] 2.3 Write unit tests for `candidatesApi.ts` covering: successful create (JSON), successful create (multipart with CV), 400 with fieldErrors, 409 conflict, 5xx error, and `getCandidateById` success and 404

## 3. Client-side Validation

- [x] 3.1 Create `frontend/src/validation/candidateValidation.ts` with a `validateCandidateForm` function that checks required fields (firstName, lastName, email), email format, and CV file type/size; returns a `Record<string, string>` of field errors
- [x] 3.2 Write unit tests for `validateCandidateForm` covering all validation rules: missing required fields, invalid email, unsupported file type, file too large, and a fully valid input

## 4. Dashboard Page

- [x] 4.1 Create `frontend/src/pages/DashboardPage.tsx` with a heading and a prominent "Add Candidate" button that navigates to `/candidates/new`
- [x] 4.2 Create `frontend/src/pages/DashboardPage.module.css` with layout styles
- [x] 4.3 Write a React Testing Library test for `DashboardPage` verifying the "Add Candidate" button is visible and clicking it triggers navigation

## 5. Add Candidate Form — Structure

- [x] 5.1 Create `frontend/src/pages/AddCandidatePage.tsx` as the page wrapper that imports and renders `CandidateForm`
- [x] 5.2 Create `frontend/src/components/CandidateForm/CandidateForm.tsx` with the top-level form state (using `useState`) and section structure: Candidate Details, Education History, Work Experience, Additional Details, CV Upload
- [x] 5.3 Create `frontend/src/components/CandidateForm/EducationFieldset.tsx` for a single education row (degree, institution, start date, end date) with a "Remove" button
- [x] 5.4 Create `frontend/src/components/CandidateForm/WorkExperienceFieldset.tsx` for a single work experience row (company, title, start date, end date, description) with a "Remove" button
- [x] 5.5 Create `frontend/src/components/CandidateForm/CvUploadField.tsx` for the CV file input with accepted types label, selected file preview (name + size), and error display
- [x] 5.6 Create `frontend/src/components/CandidateForm/CandidateForm.module.css` with section and field styles

## 6. Add Candidate Form — Behaviour

- [x] 6.1 Implement "Add education" / "Remove" row logic in `CandidateForm`: clicking "Add education" appends an empty education entry; clicking "Remove" on a row deletes that entry by index
- [x] 6.2 Implement "Add job" / "Remove" row logic in `CandidateForm` for work experience entries
- [x] 6.3 Wire client-side validation into the form's `onSubmit` handler: call `validateCandidateForm`, set errors in state, prevent submission if any errors exist
- [x] 6.4 Implement the submission handler: call `createCandidate` from the API client, set loading state during the call, handle the result
- [x] 6.5 Implement success state: on `201` response, display a success message with the candidate's full name in a `role="status"` live region and offer a "Add another" action that resets the form
- [x] 6.6 Implement error mapping: on `400` with `fieldErrors` set per-field error state; on `409` show a conflict message at the top of the form; on `413` show a file-size message; on `5xx` show a generic retry message
- [x] 6.7 Ensure all form inputs and dynamic fieldset inputs have associated `<label>` elements with correct `htmlFor`/`id` pairs

## 7. Tests

- [x] 7.1 Write React Testing Library tests for `CandidateForm` covering the happy path: fill required fields, submit, mock successful API response, verify success message appears
- [x] 7.2 Write tests for client-side validation errors: submit empty form, verify inline errors appear for firstName, lastName, and email
- [x] 7.3 Write tests for dynamic education rows: click "Add education" twice, verify two extra rows appear; click "Remove" on one, verify it disappears
- [x] 7.4 Write tests for dynamic work experience rows: same add/remove behaviour as education
- [x] 7.5 Write tests for server-side error mapping: mock a `400` response with `fieldErrors`, verify error messages appear next to correct fields; mock a `409`, verify conflict message; mock a `500`, verify generic message
- [x] 7.6 Write a test for CV upload field: select a valid file, verify name and size are displayed; select a disallowed file type, verify error message

## 8. Documentation

- [x] 8.1 Create or update `frontend/README.md` with: how to start the dev server, required environment variables (`REACT_APP_API_URL`, `REACT_APP_API_TOKEN`), how to run tests, and a brief description of the folder structure
