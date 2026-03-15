## 1. Backend API and Data Model Setup

- [x] 1.1 Define candidate and CV entities (including education and work experience) in the data model and create any required migrations
- [x] 1.2 Implement repository interfaces and concrete implementations for candidates and candidate CVs following backend standards
- [x] 1.3 Configure secure object storage integration for CV files (bucket, credentials, and environment configuration)

## 2. Candidate Creation Endpoint

- [x] 2.1 Implement `POST /api/v1/candidates` controller/route to accept multipart form-data and JSON-only requests
- [x] 2.2 Implement candidate creation service logic to orchestrate validation, persistence, CV upload, and auditing
- [x] 2.3 Add schema-based validation for candidate fields and map validation failures to structured error responses
- [x] 2.4 Implement email uniqueness check and conflict handling according to configuration

## 3. CV Upload and Storage Behavior

- [x] 3.1 Implement CV upload handling (parsing `cvFile`, validating MIME type and size, and rejecting unsupported uploads)
- [x] 3.2 Integrate CV storage with the object storage abstraction and persist CV metadata linked to candidates
- [x] 3.3 Implement optional `POST /api/v1/candidates/{id}/cv` endpoint for late or replacement CV uploads

## 4. Candidate Read Endpoint and Security

- [x] 4.1 Implement `GET /api/v1/candidates/{id}` controller/route and service to return candidate data and CV metadata
- [x] 4.2 Apply authentication and recruiter-role authorization middleware to all candidate endpoints
- [x] 4.3 Ensure responses do not expose PII in logs or public CV URLs, returning only approved fields and metadata

## 5. Error Handling, Observability, and Documentation

- [x] 5.1 Add centralized error mapping for candidate-related validation and domain errors to the agreed HTTP status codes
- [x] 5.2 Add structured logs and metrics for candidate creation and CV upload operations, including latency and error rates
- [x] 5.3 Update or add OpenAPI/Swagger documentation for all candidate endpoints, request/response schemas, and error formats
- [x] 5.4 Implement unit and integration tests for candidate creation, CV upload, validation failures, and retrieval scenarios and wire them into CI

