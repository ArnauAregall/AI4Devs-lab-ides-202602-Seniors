## ADDED Requirements

### Requirement: Dashboard provides an entry point to add a new candidate
The recruiter dashboard SHALL display a prominently placed "Add Candidate" button that navigates the user to the add candidate form.

#### Scenario: Add Candidate button is visible on the dashboard
- **WHEN** a recruiter loads the dashboard at `/`
- **THEN** the page SHALL display a button or link labelled "Add Candidate" in a prominent, consistent location

#### Scenario: Clicking Add Candidate navigates to the form
- **WHEN** a recruiter clicks the "Add Candidate" button on the dashboard
- **THEN** the browser SHALL navigate to `/candidates/new` and the add candidate form SHALL be rendered

### Requirement: Add candidate form presents all required and optional fields grouped by section
The add candidate form SHALL organise input fields into clearly labelled sections: "Candidate details", "Education history", "Work experience", "Additional details", and "CV upload".

#### Scenario: Form renders all sections with correct fields
- **WHEN** a recruiter navigates to `/candidates/new`
- **THEN** the form SHALL display: first name, last name, and email as required fields; phone and address as optional fields; at least one education row (degree, institution, start date, end date); at least one work experience row (company, title, start date, end date, description); source and notes fields; and a CV file upload field

#### Scenario: Required fields are visually marked
- **WHEN** the add candidate form is rendered
- **THEN** required fields (first name, last name, email) SHALL be visually indicated as required (e.g. with an asterisk or "required" label)

### Requirement: Education and work experience sections support dynamic rows
The add candidate form SHALL allow the recruiter to add and remove multiple education entries and work experience entries.

#### Scenario: Add an education row
- **WHEN** a recruiter clicks the "Add education" control
- **THEN** a new empty education row SHALL be appended to the education section

#### Scenario: Remove an education row
- **WHEN** a recruiter clicks the "Remove" control on an existing education row
- **THEN** that education row SHALL be removed from the form

#### Scenario: Add a work experience row
- **WHEN** a recruiter clicks the "Add job" control
- **THEN** a new empty work experience row SHALL be appended to the work experience section

#### Scenario: Remove a work experience row
- **WHEN** a recruiter clicks the "Remove" control on an existing work experience row
- **THEN** that work experience row SHALL be removed from the form

### Requirement: Client-side validation enforces required fields and format rules
The add candidate form SHALL validate inputs client-side before submission and SHALL display per-field inline error messages for invalid inputs.

#### Scenario: Submit with missing first name
- **WHEN** a recruiter submits the form with the first name field empty
- **THEN** the form SHALL NOT submit and SHALL display an inline error message next to the first name field

#### Scenario: Submit with missing last name
- **WHEN** a recruiter submits the form with the last name field empty
- **THEN** the form SHALL NOT submit and SHALL display an inline error message next to the last name field

#### Scenario: Submit with missing email
- **WHEN** a recruiter submits the form with the email field empty
- **THEN** the form SHALL NOT submit and SHALL display an inline error message next to the email field

#### Scenario: Submit with invalid email format
- **WHEN** a recruiter submits the form with a value in the email field that is not a valid email address
- **THEN** the form SHALL NOT submit and SHALL display an inline error message next to the email field indicating the format is invalid

#### Scenario: Submit with valid required fields
- **WHEN** a recruiter submits the form with all required fields filled in correctly
- **THEN** the form SHALL proceed to submit the data to the API

### Requirement: CV upload field validates file type and size client-side
The CV upload field SHALL accept only PDF and DOCX files up to 5 MB and SHALL display an error message for files that do not meet these constraints.

#### Scenario: Select an allowed file type
- **WHEN** a recruiter selects a PDF or DOCX file via the CV upload field
- **THEN** the field SHALL display the selected file name and size and SHALL NOT show a file type error

#### Scenario: Select a disallowed file type
- **WHEN** a recruiter selects a file with a MIME type other than PDF or DOCX
- **THEN** the field SHALL display an error message indicating only PDF and DOCX files are accepted

#### Scenario: Select a file exceeding the size limit
- **WHEN** a recruiter selects a file larger than 5 MB
- **THEN** the field SHALL display an error message indicating the file is too large

### Requirement: Form shows a loading state during API submission
The add candidate form SHALL disable the submit button and show a loading indicator while a submission request is in progress.

#### Scenario: Submit button is disabled during submission
- **WHEN** the recruiter submits the form and the API request is in progress
- **THEN** the submit button SHALL be disabled and SHALL indicate loading (e.g. spinner, "Saving…" label)

### Requirement: Form shows a success confirmation after candidate is created
The add candidate form SHALL display a success confirmation message when the API responds with a successful creation, including the candidate's full name.

#### Scenario: Successful candidate creation shows confirmation
- **WHEN** the API responds with a successful `201 Created` response
- **THEN** the form SHALL display a success message containing the candidate's first and last name (e.g. "Candidate 'Jane Doe' has been added successfully.")

#### Scenario: Success message announces to screen readers
- **WHEN** the success confirmation is displayed
- **THEN** the success message SHALL be rendered in a live region (e.g. `role="status"` or `aria-live="polite"`) so that screen readers announce it

### Requirement: Form displays server-side validation errors mapped to fields
When the API returns a `400` response with `fieldErrors`, the form SHALL display those errors next to their corresponding fields.

#### Scenario: Server-side field errors appear next to the affected fields
- **WHEN** the API responds with a `400` status containing `fieldErrors` for specific fields (e.g. `email`)
- **THEN** the form SHALL display those error messages next to the corresponding input fields

### Requirement: Form displays a user-friendly message for unexpected server errors
When the API returns a `409`, `413`, or `5xx` response, the form SHALL display a non-technical error message at the top of the form.

#### Scenario: Duplicate email shows a conflict message
- **WHEN** the API responds with a `409 Conflict` error
- **THEN** the form SHALL display a message indicating that a candidate with this email already exists

#### Scenario: File too large server error shows a size message
- **WHEN** the API responds with a `413 Payload Too Large` error
- **THEN** the form SHALL display a message indicating the CV file is too large

#### Scenario: Generic server error shows a retry message
- **WHEN** the API responds with a `5xx` error
- **THEN** the form SHALL display a non-technical message (e.g. "Something went wrong. Please try again.") and SHALL NOT expose technical error details

### Requirement: Form inputs are accessible and keyboard-navigable
All form inputs SHALL have associated labels, be reachable via keyboard navigation, and respect a logical focus order.

#### Scenario: All inputs have associated labels
- **WHEN** the add candidate form is rendered
- **THEN** every input, select, and file field SHALL have an associated `<label>` element linked via `for`/`id` or equivalent ARIA attribute

#### Scenario: Form is fully navigable by keyboard
- **WHEN** a recruiter uses Tab and Shift+Tab to navigate the form
- **THEN** focus SHALL move through all interactive elements in a logical, top-to-bottom order without any focusable element being skipped
