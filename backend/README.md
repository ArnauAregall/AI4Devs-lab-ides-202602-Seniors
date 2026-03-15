# LTI ATS – Backend

Node.js / Express / TypeScript API for the LTI Applicant Tracking System.

## Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14

## Setup

```bash
npm install
cp .env.example .env   # then edit .env with your values
```

### Required environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | HTTP port (default `3010`) |
| `FRONTEND_URL` | Allowed CORS origin (default `http://localhost:3000`) |
| `JWT_SECRET` | **Required.** HS256 signing secret – must be at least 32 random bytes. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CV_UPLOAD_DIR` | Directory for CV file uploads (default `./uploads/cvs`) |
| `CV_MAX_SIZE_BYTES` | Maximum CV file size in bytes (default `5242880` = 5 MB) |

> **Security**: `JWT_SECRET` must never be committed to source control. The `.env` file is git-ignored.

## Running locally

```bash
npm run dev        # ts-node-dev with hot reload
npm run build      # compile TypeScript
npm start          # run compiled output
```

## Database

```bash
# Apply migrations
npx prisma migrate dev

# Seed development data (creates recruiter@example.com user + sample candidate)
NODE_ENV=development npx prisma db seed
```

Default development credentials (after seeding):

| Email | Password |
|---|---|
| `recruiter@example.com` | `recruiter123` |

## Authentication

The API uses short-lived JWT access tokens (15 min) and `HttpOnly` refresh-token cookies (7 days).

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate with `{ email, password }` — returns `{ accessToken }` and sets refresh cookie |
| `POST` | `/api/v1/auth/refresh` | Exchange refresh cookie for a new access token |
| `POST` | `/api/v1/auth/logout` | Clear refresh cookie |

All candidate endpoints require a valid `Authorization: Bearer <accessToken>` header.

The login endpoint is rate-limited to **10 requests per minute per IP**.

## Testing

```bash
npm test               # run all tests
npm run test:coverage  # with coverage report
```

## API Documentation

Swagger UI is available at `http://localhost:3010/api-docs` when the server is running.
