### Requirement: Candidate schema defines all required tables and columns
The system SHALL define the following tables in the PostgreSQL database with the specified columns and types: `candidates`, `candidate_educations`, `candidate_work_experiences`, and `candidate_cvs`.

#### Scenario: All candidate tables exist after migration
- **WHEN** the migration `add_candidate_schema` is applied to an empty PostgreSQL instance
- **THEN** the tables `candidates`, `candidate_educations`, `candidate_work_experiences`, and `candidate_cvs` SHALL all exist with the columns, types, and constraints defined in the schema

#### Scenario: Required columns are not nullable
- **WHEN** an insert is attempted with a NULL value in a required column (`first_name`, `last_name`, `email`, `created_by`, `storage_key`, `file_name`, `mime_type`, `size_bytes`)
- **THEN** the database SHALL reject the insert with a not-null constraint violation

### Requirement: Candidate email is indexed and enforces uniqueness
The `candidates` table SHALL have a unique index on the `email` column to support fast lookup and enforce the one-candidate-per-email constraint at the database level.

#### Scenario: Duplicate email rejected at DB level
- **WHEN** two candidate rows with the same `email` are inserted
- **THEN** the database SHALL reject the second insert with a unique constraint violation on `email`

#### Scenario: Email lookup uses index
- **WHEN** a query filters candidates by `email`
- **THEN** the query plan SHALL use the unique index on `email` rather than a sequential scan

### Requirement: Candidate last name is indexed for search performance
The `candidates` table SHALL have an index on `last_name` to support fast retrieval of candidates by surname.

#### Scenario: Last name index exists after migration
- **WHEN** the migration is applied
- **THEN** an index on `candidates.last_name` SHALL exist in the database schema

### Requirement: Foreign key columns on child tables are indexed
The `candidate_educations`, `candidate_work_experiences`, and `candidate_cvs` tables SHALL each have an index on their `candidate_id` foreign-key column.

#### Scenario: Child table FK indexes exist after migration
- **WHEN** the migration is applied
- **THEN** indexes on `candidate_educations.candidate_id`, `candidate_work_experiences.candidate_id`, and `candidate_cvs.candidate_id` SHALL all exist in the database schema

### Requirement: Cascade delete from candidate to related records
Deleting a candidate record SHALL cascade to all associated education, work experience, and CV metadata records.

#### Scenario: Cascade delete removes all child records
- **WHEN** a candidate row is deleted from the `candidates` table
- **THEN** all rows in `candidate_educations`, `candidate_work_experiences`, and `candidate_cvs` that reference that candidate SHALL be automatically deleted

### Requirement: CV size is stored as a non-negative bigint
The `candidate_cvs` table SHALL store file size in a `size_bytes` column of type `bigint` and SHALL enforce that the value is non-negative.

#### Scenario: Negative size_bytes rejected
- **WHEN** a row is inserted into `candidate_cvs` with a negative `size_bytes` value
- **THEN** the database SHALL reject the insert with a check constraint violation

#### Scenario: Zero and positive size_bytes accepted
- **WHEN** a row is inserted into `candidate_cvs` with `size_bytes` equal to zero or a positive integer
- **THEN** the database SHALL accept the insert

### Requirement: Candidate has an updatedAt audit timestamp
The `candidates` table SHALL include an `updated_at` column of type `timestamptz` that is automatically set to the current time whenever a candidate row is updated.

#### Scenario: updatedAt is set on candidate creation
- **WHEN** a new candidate row is inserted
- **THEN** the `updated_at` column SHALL contain a timestamp close to the insertion time

#### Scenario: updatedAt is refreshed on candidate update
- **WHEN** any field on a candidate row is updated
- **THEN** the `updated_at` column SHALL be updated to the time of the update

### Requirement: Migration applies cleanly from an empty database and is reversible
The Prisma migration `add_candidate_schema` SHALL apply successfully to an empty PostgreSQL database and SHALL be reversible, leaving no residual objects after rollback.

#### Scenario: Migration applies to empty database
- **WHEN** `prisma migrate deploy` is run against an empty PostgreSQL database
- **THEN** all tables, indexes, and constraints SHALL be created without errors

#### Scenario: Migration reset restores empty state
- **WHEN** `prisma migrate reset` is run
- **THEN** all candidate-related tables SHALL be dropped and the database SHALL return to the empty state

### Requirement: Seed script provides representative development data
The project SHALL include a Prisma seed script that populates one candidate with at least one education entry, one work experience entry, and one CV metadata record for local development.

#### Scenario: Seed script runs without errors
- **WHEN** `prisma db seed` is executed against a freshly migrated local database
- **THEN** the seed script SHALL complete without errors and the `candidates` table SHALL contain at least one row with associated education, work experience, and CV metadata records

#### Scenario: Seed script is guarded from production execution
- **WHEN** the seed script is executed outside of a `development` environment
- **THEN** the script SHALL exit without inserting any data
