## Why

The ATS has no formally defined, version-controlled PostgreSQL schema for candidate data, which means the current Prisma schema (introduced as part of US-001) lacks the normalization, indexing, constraint, and migration story required to support the product reliably as it evolves. Formalizing the schema now ensures that every environment (local, CI, production) starts from the same baseline and that future changes are tracked through proper migrations.

## What Changes

- Align the Prisma schema with the full normalized data model specified in US-002: UUIDs as primary keys, `updated_at` audit column, proper column-length annotations, and check constraints.
- Add `updated_at` to the `candidates` table (with automatic update on every write).
- Rename/align table and column naming to project conventions (`candidate_educations`, `candidate_work_experiences`, `candidate_cvs`).
- Add all required database-level constraints and indexes:
  - Unique index on `candidates.email`.
  - Indexes on all `candidate_id` foreign-key columns.
  - Index on `candidates.last_name` for name-based lookups.
  - Non-negative check constraint on `candidate_cvs.size_bytes`.
- Create a single Prisma migration (`add_candidate_schema`) that applies all tables, indexes, and constraints against a fresh PostgreSQL instance and can be rolled back cleanly.
- Add a database seed script for local development with one representative candidate (profile, one education entry, one work experience entry, one CV metadata record).
- Document how to run migrations locally and in CI/CD.

## Capabilities

### New Capabilities
- `candidate-db-schema`: The normalized PostgreSQL schema and migration set that defines the authoritative structure for candidate data persistence, including tables, constraints, indexes, and the seed script.

### Modified Capabilities
- `candidate-management-api`: The API now depends on the full schema with `updated_at`, UUID PKs, and the aligned table/column names — the repository layer must reflect the updated Prisma client types.
- `candidate-cv-storage`: CV metadata table (`candidate_cvs`) gains `size_bytes` as a `bigint` with a non-negative check constraint and a unique `candidate_id` index enforcing one active CV per candidate.

## Impact

- **Prisma schema** (`backend/prisma/schema.prisma`): updated field types, added `updated_at`, corrected table names via `@@map`, added `@@index` and `@@unique` directives.
- **Prisma migration**: new migration file created via `prisma migrate dev --name add_candidate_schema`.
- **Seed script** (`backend/prisma/seed.ts`): new file providing one sample candidate with related records for local development.
- **Repository layer** (`backend/src/infrastructure/repositories/`): minor updates to align with new Prisma-generated types (UUID strings vs integer ids, `updatedAt` field).
- **CI/CD pipeline**: migration step added before running integration tests.
- **Documentation**: `README` or equivalent updated with migration commands.
