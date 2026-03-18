# Enhance — Cardiac Load Monitoring Platform

A sports-science dashboard for monitoring athlete cardiac and training metrics, built for coaches and administrators at Enhance Health.

## Project Evolution

### Phase 1 — Frontend (React + Vite)
Started as a pure frontend application with React and Vite. Athlete data was loaded directly from CSV files on the client side. The UI included individual athlete dashboards with training load, readiness, and feature charts using Recharts.

### Phase 2 — Backend (FastAPI + PostgreSQL)
Migrated to a full-stack architecture. A FastAPI backend was introduced to serve data through REST APIs, with PostgreSQL as the database. CSV data was migrated into the database via a custom script (`backend/scripts/migrate_csv.py`). The frontend was updated to fetch all data through API calls proxied via Vite's dev server. Docker support was added for containerised deployment.

### Phase 3 — Authentication & Security
Implemented a complete auth system with production hardening:

- **JWT access tokens** (HS256, 15-min expiry) + **opaque refresh tokens** (7-day expiry, DB-backed)
- **Refresh token rotation** — old token revoked on each refresh, preventing reuse
- **Role-based access control** — admin, coach, and athlete roles with scoped data access
- **User management** — admin CRUD for users, coach-athlete assignment, password resets
- **Rate limiting** — 5 login attempts/min per IP via slowapi
- **CORS restriction** — allowlisted origins only (no wildcard)
- **SECRET_KEY validation** — rejects placeholder keys and enforces minimum length on startup
- **Silent token refresh** — frontend intercepts 401s and transparently refreshes tokens with singleton promise deduplication

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, Recharts, Lucide icons |
| Backend | FastAPI, SQLAlchemy, Pydantic, python-jose, passlib (bcrypt) |
| Database | PostgreSQL |
| Auth | JWT + refresh token rotation, slowapi rate limiting |
| Deployment | Docker, docker-compose |

## Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
# Set environment variables (see .env.example)
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:8000`.
