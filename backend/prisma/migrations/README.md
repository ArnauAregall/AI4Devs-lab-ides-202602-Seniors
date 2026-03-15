# Migrations

Run the following command to create and apply the migration for candidates:

```bash
npx prisma migrate dev --name add_candidate_management
```

This will create:
- `candidates` table
- `educations` table
- `work_experiences` table
- `candidate_cvs` table

For production:
```bash
npx prisma migrate deploy
```
