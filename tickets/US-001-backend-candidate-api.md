## User Story: Backend – Candidate Management API

**As a** recruiter using the ATS,  
**I want** a secure backend API to create and manage candidate records,  
**so that** the recruiter-facing UI can reliably store, validate, and retrieve candidate data and documents.

---

### Functional Scope

- **Create candidate**: Accept candidate data (first name, last name, email, phone, address, education, work experience) and persist it.
- **Upload CV**: Accept and store a CV file in PDF or DOCX format, linked to the candidate.
- **Validation**: Enforce data validation rules and return meaningful errors.
- **Error handling**: Handle infrastructure/server errors gracefully.
- **Auditing**: Record when and by whom a candidate was created.
- **Read candidate** (minimal for now): Return candidate details (including CV metadata) for display in the UI.

---

### API Design (proposed)

**Base path**: `/api/v1/candidates`

**POST `/api/v1/candidates`**

- **Purpose**: Create a new candidate with optional CV upload.
- **Request**:
  - **Content-Type**:
    - `multipart/form-data` (preferred, for combined form + file), or
    - `application/json` (for data) plus separate upload endpoint for CV.
  - **Fields** (body):
    - `firstName` (string, required, max 100)
    - `lastName` (string, required, max 100)
    - `email` (string, required, valid email, unique per candidate in system if required by product)
    - `phone` (string, optional, format/length validated)
    - `address` (string, optional, max 255)
    - `education` (array of objects, optional):
      - `degree` (string, optional)
      - `institution` (string, optional)
      - `startDate` (ISO 8601 date, optional)
      - `endDate` (ISO 8601 date, optional)
    - `workExperience` (array of objects, optional):
      - `company` (string, optional)
      - `title` (string, optional)
      - `startDate` (ISO 8601 date, optional)
      - `endDate` (ISO 8601 date, optional)
      - `description` (string, optional, max 2000)
    - `source` (string, optional, e.g. “LinkedIn”, “Job board”, “Referral”)
    - `notes` (string, optional, max 2000)
  - **File**:
    - `cvFile` (file, optional, PDF or DOCX only, max size configurable, e.g. 5 MB).
- **Responses**:
  - `201 Created`: returns created candidate resource.
  - `400 Bad Request`: invalid input (per-field errors).
  - `409 Conflict`: e.g. email already exists if uniqueness enforced.
  - `413 Payload Too Large`: CV exceeds maximum size.
  - `500 Internal Server Error`: unexpected failure, with generic message.

**GET `/api/v1/candidates/{id}`**

- **Purpose**: Fetch candidate details for confirmation after creation and for later views.
- **Response**: Same shape as creation response (minus any sensitive internal fields).

**(Optional)** POST `/api/v1/candidates/{id}/cv`

- For uploading/replacing a CV if not sent with initial creation.

---

### Validation & Error Handling

- **Email**: required, valid email format; configurable uniqueness rule.
- **Name**: `firstName` and `lastName` required, length limits.
- **File types**: reject non-PDF/DOCX with clear error.
- **File size**: enforce max, configurable via environment/config.
- **Structured errors**:
  - Return machine-readable error codes plus human-readable messages.

---

### Security & Non-Functional Requirements

- **Authentication & Authorization**:
  - Only authenticated recruiters (or users with equivalent role) can create candidates.
  - Enforce role-based access control for all endpoints.
- **Data protection**:
  - CV storage in secure object storage or equivalent (no world-readable access).
  - Avoid logging PII and document contents; log only IDs and high-level events.
- **Performance**:
  - Define P95 latency target for `POST /candidates` under normal load (e.g. < 500ms excluding CV upload time).
- **Reliability**:
  - Define behavior if CV upload fails after candidate creation (rollback vs partial success) and implement accordingly.
- **Observability**:
  - Log candidate create events with anonymized identifiers.
  - Expose metrics (request count, error rate, latency buckets).

---

### Implementation Notes

- **Architecture**:
  - Controller/route handlers for HTTP interface.
  - Service layer for business logic (validation, orchestration).
  - Repository/data-access layer for DB + storage interactions.
- **Tech stack**:
  - Use the backend framework and patterns defined in project standards (e.g. Node.js + Express/Nest with TypeScript).

---

### Testing & Documentation

- **Tests**:
  - Unit tests for service-level validation and business logic.
  - Integration tests for endpoints, including multipart upload happy path and failure modes.
- **Documentation**:
  - Add/update API documentation (OpenAPI/Swagger or equivalent) for all implemented endpoints.

---

### Definition of Done

- Endpoints implemented and accessible in the development environment.
- Validation, error handling, and security behavior match this specification.
- All automated tests for this ticket are passing and wired into CI.
- API documentation updated and shared with frontend developers.