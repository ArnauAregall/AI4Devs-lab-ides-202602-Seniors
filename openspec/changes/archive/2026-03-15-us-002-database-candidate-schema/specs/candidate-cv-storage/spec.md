## MODIFIED Requirements

### Requirement: Store CV in secure object storage
The system SHALL store CV files in secure object storage and SHALL persist only metadata and an internal reference to the storage location in the primary database. The persisted CV metadata SHALL include `sizeBytes` as a positive integer value representing the file size in bytes.

#### Scenario: Successful CV storage
- **WHEN** a recruiter uploads a supported CV file within the size limit
- **THEN** the system SHALL store the file in object storage, persist a storage key and metadata (filename, content type, sizeBytes, uploadedAt) with `sizeBytes` as a non-negative integer, and associate the CV with the candidate

### Requirement: CV metadata exposure
The system SHALL expose only CV metadata through candidate read APIs and SHALL NOT expose direct public URLs for CV downloads. The metadata object SHALL include `sizeBytes` (in bytes) instead of a generic `size` field.

#### Scenario: Return CV metadata on candidate read
- **WHEN** a recruiter retrieves a candidate that has an associated CV
- **THEN** the system SHALL include a CV metadata object (identifier, filename, content type, sizeBytes, and uploadedAt) in the candidate response and SHALL NOT include a publicly accessible document URL
