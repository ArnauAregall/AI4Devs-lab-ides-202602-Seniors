## ADDED Requirements

### Requirement: Accept supported CV file types
The system SHALL accept only CV files in PDF or DOCX format for upload and SHALL reject unsupported file types.

#### Scenario: Upload supported CV type
- **WHEN** a recruiter uploads a CV file with a PDF or DOCX content type as part of a candidate creation or CV upload request
- **THEN** the system SHALL accept the file and continue processing the request

#### Scenario: Reject unsupported CV type
- **WHEN** a recruiter uploads a CV file with an unsupported content type
- **THEN** the system SHALL reject the request with `400 Bad Request` and an error code indicating an unsupported file type

### Requirement: Enforce maximum CV file size
The system SHALL enforce a configurable maximum CV file size and SHALL reject uploads that exceed this limit.

#### Scenario: Upload CV within size limit
- **WHEN** a recruiter uploads a CV file whose size is less than or equal to the configured maximum
- **THEN** the system SHALL accept the file and continue processing the request

#### Scenario: Reject oversized CV
- **WHEN** a recruiter uploads a CV file whose size exceeds the configured maximum
- **THEN** the system SHALL reject the request with `413 Payload Too Large` and an error code indicating that the file size limit was exceeded

### Requirement: Store CV in secure object storage
The system SHALL store CV files in secure object storage and SHALL persist only metadata and an internal reference to the storage location in the primary database.

#### Scenario: Successful CV storage
- **WHEN** a recruiter uploads a supported CV file within the size limit
- **THEN** the system SHALL store the file in object storage, persist a storage key and metadata (filename, content type, size, uploadedAt), and associate the CV with the candidate

### Requirement: Link a single current CV per candidate
The system SHALL maintain at most one current CV per candidate and SHALL update the stored reference when a CV is replaced.

#### Scenario: Replace existing CV
- **WHEN** a recruiter uploads a new CV for a candidate that already has a stored CV
- **THEN** the system SHALL store the new CV, update the candidate to reference the new CV, and optionally mark the previous CV as superseded while preventing it from being used as the active CV

### Requirement: CV metadata exposure
The system SHALL expose only CV metadata through candidate read APIs and SHALL NOT expose direct public URLs for CV downloads.

#### Scenario: Return CV metadata on candidate read
- **WHEN** a recruiter retrieves a candidate that has an associated CV
- **THEN** the system SHALL include a CV metadata object (identifier, filename, content type, size, and uploadedAt) in the candidate response and SHALL NOT include a publicly accessible document URL

### Requirement: Observability for CV operations
The system SHALL log and collect metrics for CV upload operations, including success and failure rates.

#### Scenario: Log CV upload outcome
- **WHEN** a CV upload operation succeeds or fails
- **THEN** the system SHALL log a structured event that includes the candidate identifier (or attempted identifier), the result, and a high-level reason for failure without logging CV contents or other sensitive document data
