## Why

The ATS currently lacks a dedicated, well-defined backend API for creating and managing candidate records, including CV uploads. This makes it difficult for the recruiter-facing UI to reliably persist candidate data, enforce consistent validation, and handle documents securely, which slows down recruiter workflows and increases the risk of data quality issues.

## What Changes

- Introduce a versioned REST API under `/api/v1/candidates` for candidate creation and retrieval.
- Implement a `POST /api/v1/candidates` endpoint that accepts candidate profile data and an optional CV upload in a single request.
- Implement a `GET /api/v1/candidates/{id}` endpoint to retrieve candidate details, including CV metadata, for display in the recruiter UI.
- Optionally provide `POST /api/v1/candidates/{id}/cv` to upload or replace a CV after initial creation when not provided in the original request.
- Enforce structured validation rules for core fields (names, email, file type, file size) and return machine-readable error responses.
- Add auditing fields (createdAt, createdBy) when persisting candidates.
- Integrate secure document storage for CV files and store only references/metadata in the primary database.
- Add logging and metrics around candidate creation requests, errors, and latency.

## Capabilities

### New Capabilities
- `candidate-management-api`: Backend API to create and retrieve candidate records, including validation, auditing, and minimal read support for the recruiter UI.
- `candidate-cv-storage`: Secure upload, storage, and retrieval of CV documents associated with candidates, including validation of file type and size and exposure of CV metadata.

### Modified Capabilities
- `<existing-name>`: <what requirement is changing>

## Impact

- **Backend services**: New controller/route handlers, service layer, and repository components to support candidate creation, retrieval, and CV upload.
- **Database**: New candidate-related tables/entities and relationships, including fields for audit information and CV metadata; possible migration scripts.
- **Object storage / file subsystem**: Configuration and integration with secure storage for CV files (e.g., S3-compatible bucket or equivalent).
- **Authentication & authorization**: Enforcement of recruiter-only access to candidate endpoints and alignment with existing auth/role mechanisms.
- **Validation & error handling**: Centralized validation for candidate payloads and consistent error response format for the API.
- **Observability**: New logs and metrics (request counts, error rates, latency) for candidate API operations.
- **API documentation**: Updates to OpenAPI/Swagger (or equivalent) to describe new endpoints, payloads, responses, and error structures.
