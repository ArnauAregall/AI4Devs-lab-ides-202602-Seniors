## MODIFIED Requirements

### Requirement: Auditing candidate creation
The system SHALL record when and by whom each candidate record was created, and SHALL record the last time the candidate record was modified.

#### Scenario: Audit fields populated on create
- **WHEN** a recruiter successfully creates a candidate
- **THEN** the persisted candidate record SHALL include `createdAt`, `updatedAt`, and `createdBy` fields, where `createdAt` and `updatedAt` are both set to the creation time and `createdBy` is derived from the authenticated user context

#### Scenario: updatedAt reflects the latest modification time
- **WHEN** a candidate record is updated after initial creation
- **THEN** the `updatedAt` field SHALL reflect the time of the most recent modification while `createdAt` remains unchanged
