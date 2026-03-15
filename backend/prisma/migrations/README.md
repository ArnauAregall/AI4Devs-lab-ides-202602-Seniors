# Database Migrations

This directory contains Prisma migration files for the LTI ATS backend.

## Applied Migrations

| Migration | Description |
|-----------|-------------|
| `20260315183547_add_candidate_schema` | Initial candidate schema: `candidates`, `candidate_educations`, `candidate_work_experiences`, `candidate_cvs` tables with all indexes and constraints |

## Schema Overview

The migration creates:

- **`candidates`** — Core candidate profile with `createdAt`, `updatedAt` (auto-managed), `createdBy` audit fields. Unique index on `email`, index on `lastName`.
- **`candidate_educations`** — Education history linked to a candidate (CASCADE on delete). Index on `candidateId`.
- **`candidate_work_experiences`** — Work experience records linked to a candidate (CASCADE on delete). Index on `candidateId`.
- **`candidate_cvs`** — CV file metadata (storage key, filename, content type, size in bytes). `size_bytes` is `bigint` with a non-negative check constraint. Index on `candidateId`.

## Running Migrations

### Local development — apply pending migrations

```bash
npx prisma migrate dev
```

### Local development — create a new migration

```bash
npx prisma migrate dev --name <migration_name>
```

### Local development — reset the database (drops all data and re-applies all migrations)

```bash
npx prisma migrate reset
```

> **Warning:** This drops all data. Only use in local development.

### Production / CI — apply pending migrations without prompts

```bash
npx prisma migrate deploy
```

## Seeding the Database

A seed script is provided for local development. It inserts one sample candidate with associated education, work experience, and CV metadata.

```bash
NODE_ENV=development npx prisma db seed
```

> The seed script is guarded to run only when `NODE_ENV=development`. It will silently skip in other environments.

## Regenerating the Prisma Client

After any schema change, regenerate the Prisma client:

```bash
npx prisma generate
```
