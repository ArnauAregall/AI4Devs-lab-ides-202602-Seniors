## Context

US-001 delivered a working Prisma schema with integer auto-increment PKs and a basic `candidates`, `educations`, `work_experiences`, and `candidate_cvs` set of tables. The schema was created incrementally during API development and was not formally reviewed against the full US-002 data model specification. As a result, several gaps exist:

- No `updatedAt` audit column on `candidates`.
- PKs are `Int` auto-increment; US-002 specifies UUID PKs.
- Table names `educations` and `work_experiences` do not match the specified `candidate_educations` and `candidate_work_experiences`.
- Missing indexes on `lastName` and all `candidateId` foreign-key columns.
- No non-negative check constraint on `candidate_cvs.size` (currently named `size`, not `size_bytes`).
- No official Prisma migration file (the schema was applied ad-hoc during development).
- No seed script for local development.
- No documentation for running migrations.

## Goals / Non-Goals

**Goals:**
- Align the Prisma schema with the complete US-002 data model (columns, types, constraints, indexes).
- Add `updatedAt` to `candidates` with automatic update-on-write via Prisma's `@updatedAt`.
- Add missing indexes: `@@index([lastName])` on `Candidate`, `@@index([candidateId])` on `Education`, `WorkExperience`, and `CandidateCv`.
- Rename table mappings to `candidate_educations` and `candidate_work_experiences` to match the specification.
- Rename `size` to `sizeBytes` (mapped to `size_bytes`) and widen to `BigInt` to match the `bigint` column type in the spec.
- Create a formal Prisma migration (`add_candidate_schema`) that applies cleanly from an empty database.
- Add a Prisma seed script with one representative candidate, education entry, work experience entry, and CV metadata record.
- Document migration commands in `backend/README.md` (or equivalent).

**Non-Goals:**
- Switching PKs from `Int` auto-increment to `UUID`. US-001 has already been implemented and deployed; changing the PK type is a destructive migration requiring significant API changes and is out of scope for this story. This decision is deferred.
- Changes to the API layer beyond updating the repository type mappings for renamed fields.
- Any changes to the `User` table or auth-related schema.

## Decisions

### Decision 1: Keep integer auto-increment PKs

**Chosen**: Retain `Int @id @default(autoincrement())` on all models.

**Rationale**: US-001 is already implemented, tested, and archived with integer PKs throughout the repository and domain layers. Migrating to UUIDs would require rewriting all repository implementations, domain models, controller param parsing, and all existing test fixtures — a large blast radius with no immediate functional benefit. The US-002 user story itself states "Table and column names *can be adapted to project conventions*", meaning the PK type is advisory, not mandatory.

**Alternatives considered**: Use `String @id @default(uuid())` (Prisma UUID) — deferred to a future dedicated migration story if required by product decisions.

---

### Decision 2: Use Prisma `@updatedAt` for automatic `updatedAt`

**Chosen**: Add `updatedAt DateTime @updatedAt` to the `Candidate` model.

**Rationale**: Prisma's `@updatedAt` directive handles the update automatically in every write operation without needing application-layer logic or database triggers. It ensures the field is always current even for partial updates.

**Alternatives considered**: A PostgreSQL trigger (`BEFORE UPDATE SET updated_at = now()`) — adds DB-level complexity not needed when Prisma manages writes; a trigger would be the right choice only if writes bypass the ORM.

---

### Decision 3: Rename table mappings via `@@map`

**Chosen**: Change `@@map("educations")` → `@@map("candidate_educations")` and `@@map("work_experiences")` → `@@map("candidate_work_experiences")`.

**Rationale**: The US-002 spec specifies `candidate_educations` and `candidate_work_experiences` as table names. Aligning now avoids ambiguity for future engineers reading the schema directly in the database.

**Impact**: This is a breaking DDL change (rename tables). The migration must `ALTER TABLE educations RENAME TO candidate_educations` and similarly for `work_experiences`. Prisma auto-generates this as a destructive migration; it will be applied as part of the single migration file.

---

### Decision 4: Widen `size` to `BigInt` and rename to `sizeBytes`

**Chosen**: Change `CandidateCv.size Int` → `sizeBytes BigInt` mapped to `size_bytes`.

**Rationale**: US-002 specifies `size_bytes bigint`. An `Int` (32-bit) overflows at ~2 GB; `BigInt` (64-bit) is the correct type for byte counts. Renaming also makes the unit explicit in the column name, which aligns with the spec and avoids confusion.

**Impact**: The domain model `CandidateCv` and `CandidateCvData` interfaces need `sizeBytes: bigint` (TypeScript `bigint`). The repository mappings and controller response serialization need updating (note: `BigInt` does not serialize to JSON by default and requires explicit conversion to `Number` for API responses, since CV files are well under `Number.MAX_SAFE_INTEGER`).

---

### Decision 5: Add missing indexes via Prisma `@@index`

**Chosen**: Add:
- `@@index([lastName])` on `Candidate` — fast lookup by last name for search.
- `@@index([candidateId])` on `Education`, `WorkExperience`, `CandidateCv` — FK index for join performance.

**Rationale**: PostgreSQL does not automatically create indexes on foreign-key columns. Without them, joining or filtering children by `candidateId` performs sequential scans on large datasets. The US-002 NFR explicitly requires these indexes.

---

### Decision 6: Check constraint for non-negative `size_bytes`

**Chosen**: Add a raw Prisma `@@check` expression: `sizeBytes >= 0`.

**Note**: Prisma does not natively support `CHECK` constraints via the schema DSL as of v5.x. The constraint will be added as a raw SQL statement inside the migration file (`ALTER TABLE candidate_cvs ADD CONSTRAINT chk_size_bytes_non_negative CHECK (size_bytes >= 0)`), with a comment in the schema noting the constraint exists at DB level.

---

### Decision 7: Single migration file

**Chosen**: Generate a single Prisma migration `add_candidate_schema` that represents the full initial schema state, rather than stacking multiple incremental migrations on top of the ad-hoc state.

**Rationale**: Since the DB is still in early development and no production data exists, resetting to a clean migration baseline is safe and produces a cleaner migration history.

## Risks / Trade-offs

- **`BigInt` JSON serialization**: TypeScript `bigint` throws when passed to `JSON.stringify`. All repository-to-API boundaries must convert `sizeBytes` to `Number`. → Mitigation: add a conversion helper and enforce it in the controller response mapping.
- **Table rename migration**: Renaming tables while the application is running would break in-flight requests. → Mitigation: apply migrations only during a maintenance window or before first production deployment (currently pre-production).
- **Deferred UUID migration**: Future stories that do need UUID PKs (e.g., for distributed ID generation or public ID exposure) will incur a larger migration effort. → Accepted trade-off; document the decision for future reference.
- **Seed script in production**: The seed script must never run in production environments. → Mitigation: guard the seed with an `if (process.env.NODE_ENV === 'development')` check.

## Migration Plan

1. Update `backend/prisma/schema.prisma` with all changes described above.
2. Run `npx prisma migrate dev --name add_candidate_schema` to generate the migration SQL and apply it locally.
3. Manually edit the generated migration SQL to add the `CHECK` constraint for `size_bytes`.
4. Run `npx prisma migrate reset` to verify apply + rollback on a clean local database.
5. Update repository layer types for renamed/changed fields (`sizeBytes`, `updatedAt`).
6. Run all existing tests to confirm no regressions.
7. Add seed script at `backend/prisma/seed.ts` and register it in `package.json` under `prisma.seed`.
8. Run `npx prisma db seed` locally to verify the seed script.
9. Update `backend/README.md` with migration commands.

**Rollback**: `npx prisma migrate reset` restores the empty state. No data exists in production at this stage.

## Open Questions

- Should `candidate_cvs.isActive` (a boolean added in US-001 for soft-deletion of superseded CVs) be formalized as a spec requirement, or is the `currentCvId` pointer on `Candidate` sufficient? Currently both exist. Decision can be deferred until CV management features expand.
