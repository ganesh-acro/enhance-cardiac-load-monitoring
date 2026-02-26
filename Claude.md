# ENHANCE — Cardiac Load Monitoring Platform
Production Architecture & Migration Specification

---

# 1. PROJECT OVERVIEW

Enhance is a sports performance analytics platform focused on cardiac load monitoring.

It processes athlete biometric data including:

- Heart Rate (HR)
- HRV
- EPOC
- Session Duration
- Training Load

It computes:

- Acute:Chronic Workload Ratio (ACWR)
- Readiness Scores
- Training Intensity Zones
- Weekly & Monthly Load Trends
- Overtraining / Under-recovery Flags
- Chart-ready time-series datasets for ECharts

This system is designed to scale from individual athletes to group-level performance analytics.

---

# 2. CORE TECH STACK

## Frontend
- React (Vite)
- Tailwind CSS
- Lucide Icons
- Apache ECharts
- Theme Support (Dark / Light Mode)

## Backend
- Python 3.11+
- FastAPI
- Uvicorn
- Modular Routers
- Structured Compute Layer

## Current Storage
- CSV files in `backend/data/`

## Target Storage
- PostgreSQL (via SQLAlchemy or SQLModel)

---

# 3. HISTORICAL EVOLUTION

Understanding the evolution is critical to maintaining architectural discipline.

---

## Phase 1 — Thick Frontend (Legacy)

- React parsed CSV using PapaParse.
- Some data shaping and transformations occurred in helper files.
- Lightweight aggregations existed in the frontend.
- Logic was partially duplicated across components.
- Browsers struggled with 200+ sessions per athlete.
- No backend.

Limitations:
- Performance bottlenecks
- Logic duplication
- Poor scalability

---

## Phase 2 — Backend Modularization (Current Active Architecture)

Business logic migrated to Python backend.

Key decisions:

- All statistical computation centralized in:
  `backend/core/compute.py`

- CSV standardization handled by:
  `backend/core/data.py`

- API modularized by domain:
  - `/athletes`
  - `/dashboard`
  - `/group`
  - `/profiles`
  - `/reports`

Important Clarification:

The frontend performs **NO statistical calculations**.

Frontend responsibilities are strictly:
- Data mapping
- Minor formatting
- Rendering chart-ready JSON
- UI state handling
- Theme management

All ACWR, readiness, flags, and aggregations occur in compute.py.

---

## Phase 3 — Frontend Refactor (Presentation Only)

- Removed reduce/filter computational logic from components.
- Implemented `src/utils/dataService.js` as API bridge.
- Components now receive pre-shaped datasets.
- ECharts receives backend-structured JSON.

Frontend is now computation-free.

---

# 4. CURRENT ARCHITECTURE

| Layer | Responsibility | Implementation |
|-------|---------------|----------------|
| Storage | Persistence | CSV files |
| Transformation | Statistical logic | compute.py |
| Data Access | CSV parsing | data.py |
| API | Routing | FastAPI Routers |
| Interface | Visualization | React + ECharts |

---

# 5. CORE COMPUTATION ENGINE

`compute.py` is the statistical brain.

It handles:
- ACWR (7-day acute / 28-day chronic)
- Rolling averages
- Trend slopes
- Zone calculations
- Readiness scoring
- Risk flags
- Chart shaping

This file must remain the single source of truth for analytics.

No statistical logic may exist in:
- Routers
- ORM models
- Frontend
- Database layer

---

# 6. THE NEXT FRONTIER — POSTGRES MIGRATION

We are transitioning from file-based storage to PostgreSQL.

Objectives:

1. Replace CSV reads with database queries.
2. Introduce ORM layer (SQLAlchemy or SQLModel).
3. Preserve compute.py logic.
4. Maintain API response shape.
5. Introduce proper indexing.
6. Enable scalability beyond CSV limits.

---

# 7. TARGET RELATIONAL SCHEMA (POSTGRESQL)

The database stores fully computed session records.

PostgreSQL is responsible for:

- Durable storage
- Efficient querying
- Indexing
- Filtering
- Pagination
- Supporting performance-oriented aggregations when required

PostgreSQL MAY be used for:

- Window functions (rolling averages)
- Aggregations (weekly/monthly summaries)
- Group comparisons
- Feature extraction for ML
- Materialized views for performance optimization

However:

- Core business logic must remain defined in the compute layer.
- SQL-based optimizations must not introduce conflicting calculation rules.
- Database computations must align with compute.py definitions.

---

## 7.1 athletes

Stores athlete profile and baseline information.

Fields:

- id (Primary Key)
- name
- age
- sport
- height
- weight    
- gender 
- created_at
- updated_at

Indexes:

- idx_athletes_name

---

## 7.2 sessions

This table mirrors the current athlete session CSV structure.

Each row represents one finalized session record.

Fields must match the CSV exactly.

Typical structure (example — must match actual CSV headers):

- id (Primary Key, generated during migration)
- athlete_id (Foreign Key → athletes.id)
- session_date
- duration_seconds
- avg_hr
- max_hr
- min_hr
- hrv
- epoc
- training_load
- acute_load_7d
- chronic_load_28d
- acwr_ratio
- weekly_load
- monthly_load
- zone_1_minutes
- zone_2_minutes
- zone_3_minutes
- zone_4_minutes
- zone_5_minutes
- readiness_score
- risk_level

NOTE:
Only include fields that currently exist in the CSV files.

## 7.2.1 Future Metrics & Feature Expansion

If new computed metrics are introduced later (e.g., recovery_score, fatigue_score, advanced ML outputs):

They must be added through one of the following approaches:

Option A — Dedicated Extension Table

Create a separate table, e.g.:

session_features
- id (PK)
- session_id (FK → sessions.id)
- feature_name
- feature_value
- created_at

Option B — Versioned Metrics Table

advanced_session_metrics
- id (PK)
- session_id (FK → sessions.id)
- recovery_score
- fatigue_score
- strain_score
- model_version
- computed_at

This prevents:

- Schema bloat
- Constant migrations on the core table
- Tight coupling between experimentation and core persistence

---


## 7.3 Index Strategy (Mandatory)

- idx_sessions_athlete (athlete_id)
- idx_sessions_date (session_date)
- idx_sessions_athlete_date (athlete_id, session_date DESC)
- idx_sessions_risk (risk_level)
- idx_sessions_acwr (acwr_ratio)

---

## 7.4 Architectural Guideline

1. compute.py defines canonical metric logic.
2. Database may optimize performance using SQL features.
3. SQL optimizations must not redefine metric formulas.
4. Frontend remains computation-free.
5. Any change in metric definition requires coordinated update across compute layer and SQL logic.

---

## 7.5 Forward-Looking Design

This schema is intentionally designed to support:

- SQL window-function upgrades
- Materialized aggregates
- Group-level analytics
- ML feature pipelines
- Large-scale time-series querying
- Performance optimization without architectural rewrite

# 8. DATA FLOW RULES (NON-NEGOTIABLE)

Correct flow:

Frontend  
→ FastAPI Route  
→ Service Layer  
→ Compute Layer  
→ Repository / Data Access Layer  
→ PostgreSQL  

Never:

- Access DB directly from route
- Put business logic in ORM model
- Compute ACWR in SQL without clear architectural justification
- Reintroduce calculations into React

---

# 9. MIGRATION STRATEGY

Step 1:
Freeze CSV schema.

Step 2:
Design relational schema.

Step 3:
Write ingestion script:
- Read CSV
- Validate
- Insert into DB

Step 4:
Replace CSV logic in `data.py` with DB queries.

Step 5:
Keep compute.py unchanged where possible.

Step 6:
Verify API responses match previous JSON shape exactly.

After migration:
CSV must not be used at runtime.

---

# 10. PERFORMANCE REQUIREMENTS

We expect:
- 300+ sessions per athlete
- Scaling to 1000+ sessions
- Multiple athletes
- Group comparisons

Requirements:
- Index athlete_id
- Index session_date
- Support pagination
- Avoid N+1 queries
- Select only required fields
- No full-table scans

Future:
- SQL window functions for rolling averages
- Materialized views
- Redis caching layer

---

# 11. API DESIGN PRINCIPLES

- RESTful endpoints
- Consistent JSON schema
- Pagination for session lists
- No raw CSV exposure
- No large unbounded responses

Example:
GET /athletes/{id}/sessions?page=1&limit=20

---

# 12. FRONTEND CONTRACT

The frontend expects:

- Chart-ready arrays
- Structured time-series data
- Pre-computed metrics
- Flag indicators

Frontend must remain:
- Presentation-only
- Calculation-free
- Data-agnostic

No business logic may be reintroduced.

---

# 13. DIRECTORY REFERENCE

backend/
- main.py → API entry
- core/compute.py → statistical engine
- core/data.py → data interface layer
- routers/ → domain routers

frontend/
- src/utils/dataService.js → API gateway
- src/components/dashboard/ → visualization layer

---

# 14. SCALABILITY & FUTURE ML

Architecture must support:

- Time-series export
- Feature engineering
- Batch analytics jobs
- Injury risk prediction models
- Performance peak forecasting
- Separate analytics microservice

Schema decisions must not block ML scaling.

---

# 15. CODING STANDARDS

- No duplicated logic
- Type hints required
- Modular service layer
- Clear docstrings
- Small focused functions
- No hidden side effects
- Clean separation of responsibilities

---

# 16. ROLE OF CLAUDE

When modifying or generating code:

- Act as a senior backend architect.
- Preserve architectural layering.
- Do not break API contracts.
- Do not reintroduce frontend computation.
- Write scalable, production-ready code.
- Prefer clarity over cleverness.

---

END OF SPECIFICATION