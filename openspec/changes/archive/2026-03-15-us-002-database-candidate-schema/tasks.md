## 1. Schema Alignment

- [x] 1.1 Add `updatedAt DateTime @updatedAt` field to the `Candidate` model in `schema.prisma`
- [x] 1.2 Rename `@@map("educations")` to `@@map("candidate_educations")` and `@@map("work_experiences")` to `@@map("candidate_work_experiences")` in `schema.prisma`
- [x] 1.3 Rename `CandidateCv.size` field to `sizeBytes` mapped to `size_bytes` and change its type from `Int` to `BigInt` in `schema.prisma`
- [x] 1.4 Add `@@index([lastName])` to the `Candidate` model in `schema.prisma`
- [x] 1.5 Add `@@index([candidateId])` to the `Education`, `WorkExperience`, and `CandidateCv` models in `schema.prisma`

## 2. Migration

- [x] 2.1 Generate the Prisma migration file by running `npx prisma migrate dev --name add_candidate_schema` and verify the generated SQL includes all table renames, column changes, and indexes
- [x] 2.2 Add the raw `ALTER TABLE candidate_cvs ADD CONSTRAINT chk_size_bytes_non_negative CHECK (size_bytes >= 0)` statement to the generated migration SQL file
- [x] 2.3 Run `npx prisma migrate reset` against a clean local PostgreSQL instance and verify all tables, indexes, and the check constraint are applied correctly
- [x] 2.4 Verify rollback by running `npx prisma migrate reset` again and confirming all candidate tables are dropped

## 3. Repository and Domain Layer Updates

- [x] 3.1 Update `CandidateCvData` interface and `CandidateCv` domain model to use `sizeBytes: bigint` instead of `size: number`, and update all related constructors and mappings
- [x] 3.2 Update `PrismaCandidateCvRepository` to map `sizeBytes` (BigInt) to `Number` when serializing for API responses and to use the new column name in any raw queries
- [x] 3.3 Update `CandidateData` interface and `Candidate` domain model to include `updatedAt` field
- [x] 3.4 Update `PrismaCandidateRepository` to include `updatedAt` in the returned `Candidate` objects

## 4. Controller and Response Updates

- [x] 4.1 Update `CandidateController` to include `updatedAt` in `GET /api/v1/candidates/:id` and `POST /api/v1/candidates` response payloads
- [x] 4.2 Update `CandidateController` to serialize `sizeBytes` as a number in CV metadata responses (converting `BigInt` to `Number` explicitly)
- [x] 4.3 Update OpenAPI schema definitions in `index.ts` to document the `updatedAt` field on candidate responses and rename `size` to `sizeBytes` in the `CvMetadata` schema

## 5. Seed Script

- [x] 5.1 Create `backend/prisma/seed.ts` with one sample candidate including at least one education entry, one work experience entry, and one CV metadata record; guard execution with a `NODE_ENV === 'development'` check
- [x] 5.2 Register the seed script in `backend/package.json` under the `prisma.seed` field
- [x] 5.3 Run `npx prisma db seed` locally and verify the sample data is inserted correctly

## 6. Tests and Documentation

- [x] 6.1 Update unit tests for the `CandidateCv` domain model to use `sizeBytes` (bigint) and add test cases for the `updatedAt` field on `Candidate`
- [x] 6.2 Update integration tests for the repository layer to cover the renamed fields and verify that `updatedAt` is populated and refreshed correctly
- [x] 6.3 Update `backend/README.md` (or equivalent) with clear instructions for running migrations locally (`npx prisma migrate dev`), resetting the database (`npx prisma migrate reset`), and running the seed script (`npx prisma db seed`)
