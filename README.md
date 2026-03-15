# LTI ATS — Applicant Tracking System

A full-stack application for managing job candidates. The backend is an Express/TypeScript REST API backed by PostgreSQL via Prisma ORM. The frontend is a React 18 + TypeScript single-page application bootstrapped with Create React App.

---

## Directory Structure

```
.
├── backend/                    # Express API (Node.js / TypeScript)
│   ├── src/                    # Application source code
│   │   ├── application/        # Services and validators
│   │   ├── domain/             # Domain models and repository interfaces
│   │   ├── infrastructure/     # Prisma repositories, storage, logger
│   │   ├── middleware/         # Auth, error handler
│   │   ├── presentation/       # Controllers
│   │   └── routes/             # Express routers
│   ├── prisma/                 # Prisma schema, migrations, seed
│   ├── .env                    # Local environment variables (git-ignored)
│   ├── .env.example            # Template for environment variables
│   └── README.md               # Backend-specific documentation
├── frontend/                   # React SPA (TypeScript)
│   ├── src/                    # Application source code
│   │   ├── api/                # API clients (authApi, candidatesApi)
│   │   ├── auth/               # AuthContext — in-memory token store
│   │   ├── components/         # Shared components (CandidateForm, ProtectedRoute)
│   │   ├── pages/              # Page components (Login, Dashboard, AddCandidate)
│   │   ├── tests/              # Jest + React Testing Library tests
│   │   └── validation/         # Client-side validation logic
│   ├── .env                    # Local environment variables (git-ignored)
│   └── README.md               # Frontend-specific documentation
├── openspec/                   # OpenSpec change management
│   ├── specs/                  # Living capability specifications
│   └── changes/archive/        # Archived completed changes
├── ai-specs/                   # AI agent guidelines and project specs
├── docker-compose.yml          # PostgreSQL database container
└── README.md                   # This file
```

---

## Prerequisites

- **Node.js** 18+
- **npm** 9+
- **Docker** and **Docker Compose** (for the database)

---

## Quick Start

### 1. Start the database

```bash
docker-compose up -d
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env — set JWT_SECRET to at least 32 random bytes:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm install
npx prisma migrate deploy
NODE_ENV=development npx prisma db seed   # creates recruiter user + sample candidate
npm run dev
```

The API will be available at `http://localhost:3010`.  
Swagger UI: `http://localhost:3010/api-docs`

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`.

---

## Authentication

The system uses a JWT-based login flow:

1. Open `http://localhost:3000` — you will be redirected to `/login`
2. Sign in with the seeded credentials: **`recruiter@example.com`** / **`recruiter123`**
3. Access tokens are stored in memory only; sessions are silently restored via an `HttpOnly` refresh cookie

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `JWT_SECRET` | ✓ | HS256 signing secret (≥ 32 random bytes) |
| `PORT` | | HTTP port (default `3010`) |
| `FRONTEND_URL` | | Allowed CORS origin (default `http://localhost:3000`) |
| `CV_UPLOAD_DIR` | | CV storage directory (default `./uploads/cvs`) |
| `CV_MAX_SIZE_BYTES` | | Max CV file size in bytes (default `5242880` = 5 MB) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_API_URL` | | Backend base URL (default `http://localhost:3010`) |

---

## Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

---

## Database

```bash
# Apply pending migrations
cd backend && npx prisma migrate deploy

# Re-seed development data (resets to known state)
cd backend && NODE_ENV=development npx prisma db seed

# Reset database (drops, recreates, migrates, seeds)
cd backend && NODE_ENV=development npx prisma migrate reset
```

---

## Docker — PostgreSQL

The `docker-compose.yml` at the project root starts a PostgreSQL 16 container using the credentials defined in `backend/.env`.

```bash
docker-compose up -d      # start
docker-compose down       # stop
docker-compose down -v    # stop and remove data volume
```
