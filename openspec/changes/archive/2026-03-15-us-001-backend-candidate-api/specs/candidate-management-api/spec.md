## ADDED Requirements

### Requirement: Create candidate with optional CV
The system SHALL provide an endpoint for creating a new candidate record with structured profile data and an optional CV document in a single operation.

#### Scenario: Successful candidate creation without CV
- **WHEN** a recruiter submits a valid candidate creation request without a CV file
- **THEN** the system SHALL persist the candidate record with all provided profile fields and return `201 Created` with the created candidate representation

#### Scenario: Successful candidate creation with CV
- **WHEN** a recruiter submits a valid candidate creation request with a supported CV file attached
- **THEN** the system SHALL validate and store the CV, link it to the new candidate, persist the candidate record, and return `201 Created` with the created candidate including CV metadata

### Requirement: Candidate field validation
The system SHALL validate candidate profile fields and return structured error information for invalid input.

#### Scenario: Missing required name fields
- **WHEN** a recruiter submits a candidate creation request missing either `firstName` or `lastName`
- **THEN** the system SHALL reject the request with `400 Bad Request` and include field-level errors indicating the missing fields

#### Scenario: Invalid email format
- **WHEN** a recruiter submits a candidate creation request with an email that is not in a valid email format
- **THEN** the system SHALL reject the request with `400 Bad Request` and include a field-level error for the email field

### Requirement: Unique or conflict-prone identifier handling
The system SHALL handle conflicts for identifiers that must be unique (such as email) by returning a conflict response instead of creating a duplicate candidate record when uniqueness is enforced by product configuration.

#### Scenario: Duplicate email conflict
- **WHEN** a recruiter submits a candidate creation request with an email that already exists for another candidate and the system is configured to enforce email uniqueness
- **THEN** the system SHALL reject the request with `409 Conflict` and include an error code indicating a duplicate email

### Requirement: Retrieve candidate details
The system SHALL provide an endpoint to retrieve a single candidate by identifier, including profile data, audit information, and CV metadata when available.

#### Scenario: Retrieve existing candidate
- **WHEN** a recruiter requests `GET /api/v1/candidates/{id}` for an existing candidate
- **THEN** the system SHALL return `200 OK` with the candidate’s profile fields, audit fields, and any associated CV metadata

#### Scenario: Candidate not found
- **WHEN** a recruiter requests `GET /api/v1/candidates/{id}` for a non-existent candidate
- **THEN** the system SHALL return `404 Not Found` with an error code indicating that the candidate does not exist

### Requirement: Structured error responses
The system SHALL return structured, machine-readable error responses for validation and domain errors.

#### Scenario: Validation error structure
- **WHEN** a candidate creation request fails validation
- **THEN** the system SHALL return a response body containing an error `code`, a human-readable `message`, and a `fieldErrors` object keyed by the invalid fields

### Requirement: Authentication and authorization for candidate operations
The system SHALL restrict candidate creation and retrieval endpoints to authenticated users with recruiter-equivalent permissions.

#### Scenario: Unauthenticated access blocked
- **WHEN** an unauthenticated client attempts to call any candidate management endpoint
- **THEN** the system SHALL return `401 Unauthorized` without exposing candidate data

#### Scenario: Unauthorized role blocked
- **WHEN** an authenticated user without recruiter-equivalent permissions attempts to call a candidate management endpoint
- **THEN** the system SHALL return `403 Forbidden` and SHALL NOT perform the requested operation

### Requirement: Auditing candidate creation
The system SHALL record when and by whom each candidate record was created.

#### Scenario: Audit fields populated on create
- **WHEN** a recruiter successfully creates a candidate
- **THEN** the persisted candidate record SHALL include `createdAt` and `createdBy` fields derived from the current time and authenticated user context
