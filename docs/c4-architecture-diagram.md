# 4. Architecture diagram (C4)

This document uses **C4 model** diagrams in Mermaid. If your viewer does not render `C4Context` / `C4Container`, paste the blocks into [Mermaid Live Editor](https://mermaid.live).

---

## C4 — System context

```mermaid
C4Context
title System context — Applicant Tracking System (lab)

Person(recruiter, "Recruiter", "Uses the web UI to log in and manage candidates.")

System(ats, "Applicant Tracking System", "Single product: React SPA + Express API, JWT access token + HttpOnly refresh cookie, candidate CRUD, CV upload.")

Rel(recruiter, ats, "Uses", "HTTPS (browser)")
```

---

## C4 — Containers

```mermaid
C4Container
title Container diagram — ATS

Person(recruiter, "Recruiter", "End user")

Container_Boundary(ats, "Applicant Tracking System") {
    Container(spa, "Web application (SPA)", "React 18, TypeScript", "Login, protected routes, dashboard, add-candidate form, API client with silent refresh on 401")
    Container(api, "Backend API", "Node.js, Express, TypeScript", "POST /api/v1/auth/* (rate-limited login), JWT middleware, POST|GET /api/v1/candidates/*, multipart parsing")
    ContainerDb(db, "Database", "PostgreSQL", "Prisma — users, candidates, education, work experience, CV metadata")
    Container(fs, "CV file store", "Local filesystem", "Uploaded PDF/DOCX binaries")
}

Rel(recruiter, spa, "Uses", "HTTPS")
Rel(spa, api, "REST JSON", "Authorization: Bearer; refresh cookie on auth routes")
Rel(api, db, "Reads/writes", "Prisma / SQL")
Rel(api, fs, "Stores CV files", "Stream / path")
```