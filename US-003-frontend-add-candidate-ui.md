## User Story: Frontend – Recruiter UI for Adding Candidates

**As a** recruiter,  
**I want** a clear and intuitive interface from my main dashboard to add a new candidate,  
**so that** I can quickly capture their details, upload a CV, and receive confirmation that they have been added to the ATS.

---

### Functional Scope

- **Access point**: A clearly visible call-to-action (button/link) on the recruiter’s main dashboard to add a new candidate.
- **Add Candidate form**:
  - Capture required details: first name, last name, email.
  - Capture optional details: phone, address, education, work experience, source, notes.
  - Support multiple entries for education and work experience (add/remove rows).
  - Allow upload of a CV file (PDF or DOCX).
- **Validation**:
  - Client-side validation for required fields and formats (email, file type/size).
  - Display per-field error messages and global error summaries where appropriate.
- **Submission & feedback**:
  - Call backend `POST /api/v1/candidates` (or agreed endpoint).
  - Show loading state during submission.
  - On success, show confirmation message and optionally redirect to candidate detail view.
  - On failure, show meaningful error messaging, including server-side validation errors.
- **Responsiveness & accessibility**:
  - Layout works well on typical desktop resolutions and is usable on tablet.
  - Basic accessibility support (labels, keyboard navigation, focus states, ARIA where necessary).

---

### UI/UX Requirements

- **Entry point**:
  - On the recruiter dashboard, provide a primary button (e.g. “Add candidate”) in a consistent, prominent location (e.g. top-right).
- **Form structure**:
  - Group information sections clearly:
    - “Candidate details” (basic info).
    - “Education history”.
    - “Work experience”.
    - “Additional details” (source, notes).
    - “CV upload”.
  - Allow dynamic addition/removal of education and experience rows with clear controls (e.g. “Add education”, “Remove education”, “Add job”, “Remove job”).
- **Validation behavior**:
  - Required fields marked visually (e.g. asterisk).
  - Errors shown inline next to fields and summarized near the top if multiple errors occur.
- **File upload UX**:
  - Show selected file name, size, and allowed formats.
  - Prevent selection of obviously disallowed formats where possible; otherwise show clear error on submit.
- **Feedback**:
  - Show success toast/banner: e.g. “Candidate ‘First Last’ has been added successfully.”
  - On server errors, show non-technical copy (e.g. “Something went wrong while saving the candidate. Please try again.”).

---

### Technical Requirements

- **Tech stack**:
  - Use the frontend framework and TypeScript setup defined by the project (e.g. React + TypeScript) and follow existing architecture patterns.
- **State management**:
  - Use the project’s standard approach (component state, context, or global store) to manage form state and submission status.
- **API integration**:
  - Implement a typed client for `POST /api/v1/candidates` and `GET /api/v1/candidates/{id}`.
  - Map frontend DTOs to backend request shape, including multipart form-data if used for combined data and CV upload.
- **Error handling**:
  - Parse backend error payloads (including validation errors per field) and map them to UI messages.
  - Handle generic 5xx errors with user-friendly messaging.
- **Accessibility**:
  - Inputs associated with labels using `for`/`id` or equivalent.
  - Ensure the form is keyboard-navigable and respects focus order.
  - Announce success/error messages to screen readers when feasible.

---

### Non-Functional Requirements

- **Performance**:
  - Avoid unnecessary re-renders or large bundle bloat; lazy-load heavy components if needed.
- **Resilience**:
  - Handle network timeouts and show retry or “save again” options where appropriate.
- **Consistency**:
  - Follow the design system (colors, typography, spacing, components) defined for the project.

---

### Testing & Documentation

- **Testing**:
  - Component/unit tests for form behavior and client-side validation.
  - Integration/interaction tests for:
    - Happy path: complete candidate added successfully.
    - Validation errors on required fields and invalid email.
    - Server-side validation and 5xx error handling.
- **Documentation**:
  - Update frontend documentation or Storybook-style examples with the “Add candidate” screen and its states (empty, error, success).

---

### Definition of Done

- Recruiter can:
  - Access the “Add candidate” form from the dashboard.
  - Fill in candidate data, upload a CV, and submit successfully.
  - See client-side validation errors and server-side failure messages when applicable.
  - See a clear success confirmation and, if specified, navigate to the new candidate’s detail view.
- All specified tests are implemented and passing in CI.
- UX and accessibility meet the project’s baseline standards.

