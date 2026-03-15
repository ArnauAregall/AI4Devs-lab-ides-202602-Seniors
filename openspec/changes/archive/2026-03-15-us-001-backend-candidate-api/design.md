## Context

The ATS needs a secure, well-structured backend API to create and manage candidate records, including CV uploads, so the recruiter UI can reliably persist and retrieve data. Today there is no dedicated candidate API surface or CV storage abstraction, which risks inconsistent validation, ad-hoc data models, and insecure document handling. This design introduces a small set of backend components and integrations that align with existing backend standards (TypeScript, layered architecture, and versioned REST APIs).

The scope of this design is limited to the candidate management domain for this user story: creating candidates, uploading CVs associated with a candidate, and retrieving candidate details (including CV metadata) for the recruiter-facing UI.

## Goals / Non-Goals

**Goals:**
- Provide versioned endpoints under `/api/v1/candidates` to create and retrieve candidate records.
- Support candidate creation with structured profile data and an optional CV upload.
- Validate core fields (names, email, phone, dates) and CV files (type, size) with clear, structured errors.
- Persist candidate data with auditing information (`createdAt`, `createdBy`) and link each candidate to at most one current CV.
- Store CV files in secure object storage and expose only metadata and a backend-internal reference ID to the UI.
- Ensure endpoints are protected by existing authentication/authorization, limiting access to recruiter-equivalent roles.
- Emit logs and metrics so candidate API behavior is observable and diagnosable.

**Non-Goals:**
- Full candidate lifecycle management (updates, deletion, merging, advanced search, or filtering).
- Workflow features such as interview scheduling, job applications, or pipeline stages.
- Advanced document parsing of CVs (e.g., extracting skills or experience into structured fields).
- Bulk import/export or reporting functionality.
- Multi-tenant partitioning design beyond following existing backend standards for tenancy (if any).

## Decisions

- **API style and routing**
  - Use RESTful HTTP endpoints under the base path `/api/v1/candidates` to align with other backend services.
  - Endpoints:
    - `POST /api/v1/candidates` for candidate creation with optional CV upload (preferred as `multipart/form-data`).
    - `GET /api/v1/candidates/{id}` for retrieving a single candidate and CV metadata.
    - `POST /api/v1/candidates/{id}/cv` (optional) for uploading or replacing a CV if not provided at creation time.

- **Request/response shapes**
  - Use JSON for candidate data in both request and response bodies.
  - For `POST /api/v1/candidates`, support:
    - `multipart/form-data` combining JSON fields and `cvFile`.
    - (Optionally) pure `application/json` without CV, when no CV is provided.
  - Define a consistent response DTO that includes candidate core fields, audit fields, and a nested CV metadata object (`id`, `filename`, `contentType`, `size`, and `uploadedAt`).

- **Validation**
  - Implement a dedicated validation layer using the project’s standard validation library (e.g., schema-based validation in the service or controller layer).
  - Rules include:
    - Required: `firstName`, `lastName`, `email`.
    - Email format: valid RFC-style email.
    - Length limits: names (<= 100), address (<= 255), notes/description (<= 2000).
    - Dates: ISO 8601 for education and work experience ranges.
    - CV: MIME type restricted to PDF or DOCX, size limited via configuration.
  - Return structured error responses containing a machine-readable `code`, a human-readable `message`, and `fieldErrors` keyed by field path.

- **Persistence and data model**
  - Introduce a `Candidate` entity/table containing:
    - Basic attributes (names, contact details, address, source, notes).
    - Nested/related entities for `Education` and `WorkExperience` entries as separate tables or JSON columns (depending on existing conventions).
    - Audit fields (`createdAt`, `createdBy`).
    - A reference to the candidate’s current CV (e.g., `cvId` or `cvStorageKey`).
  - Introduce a `CandidateCv` or generic `Document` entity to represent stored CVs, holding:
    - Candidate foreign key.
    - Storage key/path in the object storage backend.
    - Filename, MIME type, file size, and `uploadedAt`.
  - Encapsulate persistence in a repository layer (`CandidateRepository`, `CandidateCvRepository`) to keep controllers/services independent of the underlying database technology.

- **CV storage integration**
  - Integrate with the existing or newly created object storage abstraction (e.g., S3-compatible bucket wrapper) instead of writing directly to the filesystem.
  - On successful CV upload:
    - Stream the file into object storage.
    - Store only the resulting storage key and metadata in the database.
  - Ensure the API never exposes public URLs directly; any future download endpoint should enforce authorization before returning file data or time-limited URLs.

- **Security and authorization**
  - Reuse the existing authentication middleware to ensure all endpoints are accessible only to authenticated users.
  - Use role/permission checks (e.g., `recruiter` or equivalent role) in controllers or an authorization layer to gate candidate operations.
  - Avoid logging PII or file contents; log identifiers (candidate ID, CV ID, storage key) and high-level outcomes only.

- **Error handling and transaction semantics**
  - Use centralized error handling middleware to map domain and validation errors to HTTP status codes.
  - For `POST /api/v1/candidates` with CV:
    - Create candidate and upload CV within a single logical operation.
    - Prefer a transactional approach:
      - Start DB transaction.
      - Create candidate record.
      - Upload CV to object storage.
      - Persist CV metadata and link candidate to CV.
      - Commit transaction; on any failure, roll back DB changes and delete any partially uploaded file if possible.
  - If full rollback is not feasible (e.g., transient storage failure after DB commit), return a partial failure error and surface the inconsistency as an operational alert.

- **Observability**
  - Add structured logs for:
    - Candidate creation attempts and results (success/failure with reason).
    - CV upload attempts and results.
  - Publish metrics for:
    - Request count per endpoint and status code.
    - Error rate by error code.
    - Latency distributions (e.g., P95) for `POST /api/v1/candidates`.

## Risks / Trade-offs

- **File and DB transaction coupling**
  - *Risk*: Coupling object storage uploads with database transactions can increase latency and complexity and may be hard to fully roll back on partial failures.
  - *Mitigation*: Keep CVs relatively small (enforced by max size) and implement best-effort cleanup of orphaned files, combined with periodic background reconciliation if needed.

- **Schema evolution**
  - *Risk*: The initial data model for education and work experience might need to evolve as product requirements grow (e.g., additional fields, normalization).
  - *Mitigation*: Design schema with optional fields and consider JSON-based storage for early iterations, with clear migration steps if/when normalization is required.

- **Security misconfiguration**
  - *Risk*: Incorrectly configured object storage permissions could expose CVs.
  - *Mitigation*: Use a locked-down bucket with private access by default and rely on backend-mediated access patterns; add security tests or checks to verify configuration in non-production and production environments.

- **Performance under load**
  - *Risk*: Multipart uploads with CVs may increase request latency or impact throughput.
  - *Mitigation*: Enforce a reasonable maximum file size, use streaming uploads where supported by the framework, and track latency metrics to guide future optimizations.

- **Error response complexity**
  - *Risk*: A rich error model (field errors, codes) can be misused or inconsistently applied.
  - *Mitigation*: Centralize error construction in a helper module and reuse well-defined error codes across candidate-related endpoints.

