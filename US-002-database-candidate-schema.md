## User Story: Database – Candidate Data Model & PostgreSQL Schema

**As a** platform engineer for the ATS,  
**I want** a normalized, secure PostgreSQL schema for candidate data and CV storage metadata,  
**so that** the system can reliably persist and query candidate information as the product evolves.

---

### Functional Scope

- Define relational schema to support:
  - Candidate core profile data.
  - Education history.
  - Work experience.
  - CV file metadata (not binary content in DB if using object storage).
  - Basic auditing (created/updated timestamps, created by).
- Provide migrations to create and roll back the schema.
- Ensure indexes and constraints that support validation and performance.

---

### Data Model (proposed)

Table and column names can be adapted to project conventions.

**`candidates`**

- `id` (UUID, PK)
- `first_name` (varchar(100), not null)
- `last_name` (varchar(100), not null)
- `email` (varchar(255), not null, indexed; consider unique index based on product decision)
- `phone` (varchar(50), null)
- `address` (varchar(255), null)
- `source` (varchar(100), null)
- `notes` (text, null)
- `created_at` (timestamptz, not null, default now())
- `updated_at` (timestamptz, not null, default now())
- `created_by` (varchar(100) or FK to `users`, null for now if users not modeled yet)

**`candidate_educations`**

- `id` (UUID, PK)
- `candidate_id` (UUID, FK to `candidates.id` ON DELETE CASCADE, indexed)
- `degree` (varchar(150), null)
- `institution` (varchar(150), null)
- `start_date` (date, null)
- `end_date` (date, null)

**`candidate_work_experiences`**

- `id` (UUID, PK)
- `candidate_id` (UUID, FK to `candidates.id` ON DELETE CASCADE, indexed)
- `company` (varchar(150), null)
- `title` (varchar(150), null)
- `start_date` (date, null)
- `end_date` (date, null)
- `description` (text, null)

**`candidate_cvs`**

- `id` (UUID, PK)
- `candidate_id` (UUID, FK to `candidates.id` ON DELETE CASCADE, unique to enforce one active CV per candidate initially)
- `storage_key` (varchar(255), not null) – key/path in object storage or filesystem.
- `file_name` (varchar(255), not null)
- `mime_type` (varchar(100), not null)
- `size_bytes` (bigint, not null)
- `uploaded_at` (timestamptz, not null, default now())

---

### Constraints & Integrity Rules

- **Email**:
  - Decide whether email must be unique across all candidates; if yes, add a unique index.
  - At minimum, index `email` for fast lookup.
- **Cascade behavior**:
  - Deleting a candidate cascades to education, experience, and CV metadata via `ON DELETE CASCADE`.
- **Not-null constraints**:
  - Enforce not-null on required fields (`first_name`, `last_name`, `email`, `storage_key`, etc.).
- **Check constraints (optional but recommended)**:
  - Enforce non-negative `size_bytes`.
  - `start_date <= end_date` where both present (or enforce this in application layer if DB-level check is too rigid).

---

### Migrations & Tooling

- Use the project’s standard migration tool (e.g. Knex, TypeORM, Prisma, Flyway, Liquibase).
- Create an **initial migration** that:
  - Creates all tables, constraints, and indexes described above.
  - Uses appropriate schemas/namespaces if defined by project standards.
- Provide a **rollback** for this migration that drops created objects in the correct order.
- Optionally add **seed data** for local development:
  - One sample candidate with associated education, experience, and CV metadata.

---

### Non-Functional Requirements

- **Performance**:
  - Index fields used for lookups and filters (e.g. `email`, `last_name`, all `candidate_id` FKs).
- **Security**:
  - Do not store CV binary contents in the database when using external storage; store only metadata and storage key.
  - Ensure DB credentials and connection details are provided via secure environment variables/secrets.
- **Operational**:
  - Document how to run migrations locally and in CI/CD.
  - Ensure migrations are idempotent and play nicely with the chosen migration framework’s history table.

---

### Testing & Verification

- Run migrations against a fresh local PostgreSQL instance and verify:
  - All tables and constraints are created as expected.
  - Sample insert/select operations for candidate, education, experience, and CV metadata succeed.
- Add automated tests (if supported in project) that:
  - Apply migrations and validate basic schema assumptions (e.g. required columns exist, constraints enforce as expected).

---

### Definition of Done

- Schema is fully defined and implemented via migrations.
- Migrations apply cleanly to an empty PostgreSQL instance and can be rolled back.
- Backend can read/write candidate data using this schema without manual DB adjustments.
- Documentation is updated to describe the schema and the commands to run migrations.

