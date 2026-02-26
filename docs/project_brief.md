# PROJECT BRIEF: ENHANCE CARDIAC LOAD MONITORING

This document provides a comprehensive history and technical overview of the Enhance project to maintain context during the upcoming migration to PostgreSQL.

---

## 1. PROJECT OVERVIEW
**Enhance** is a sports performance analytics dashboard designed for cardiac load monitoring. It processes athlete biometric data (Heart Rate, HRV, EPOC, etc.) to calculate readiness scores, Acute:Chronic Workload Ratios (ACWR), and training intensity zones.

## 2. CORE TECH STACK
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
- **Visualization**: Apache ECharts (for high-performance data plotting).
- **Backend**: Python (FastAPI), Uvicorn.
- **Current Data Source**: Static CSV files (`backend/data/`).

---

## 3. HISTORICAL EVOLUTION

### Phase 1: The "Thick" Frontend (Legacy)
Initially, the application was a standalone React project.
- **Data Handling**: Raw data was stored in `dashboardData.js` or parsed from CSVs in the browser using `PapaParse`.
- **Logic**: All mathematical transformations (calculating 7-day averages, zone distributions, ACWR trends) were performed inside React components or helper files like `csvParser.js` and `chartDataPrep.js`.
- **Limitations**: Browsers struggled with 200+ sessions per athlete, and logic was duplicated across multiple dashboard views.

### Phase 2: Python Backend Migration (Modularization)
To improve performance and maintainability, the "Business Logic" was moved to a Python backend.
- **Math Engine**: Created `backend/core/compute.py` to handle all aggregations, shaping data exactly as ECharts expects it.
- **Data Standardization**: Created `backend/core/data.py` to ensure consistent date parsing and CSV reading across the app.
- **Modular Routers**: API endpoints were split into specific domains:
  - `/athletes`: Profile management.
  - `/dashboard`: Rich, chart-ready data for individual athlete views.
  - `/group`: Team-wide averages and status flags.
  - `/profiles`: Summary lists for the athlete registry.
  - `/reports`: Historical data for PDF exports.

### Phase 3: Frontend Refactoring (Presentation Only)
The React frontend was refactored to remove all computational overhead.
- **Data Agnostic**: Components like `AnalyticsOverview.jsx` and `GroupDashboard.jsx` no longer use `reduce()` or `filter()`. They receive "Chart-Ready" JSON from the backend.
- **API Bridge**: `src/utils/dataService.js` was implemented as the single source for fetching data from the FastAPI server.
- **Aesthetic Focus**: The frontend now focuses purely on premium UI/UX, theme management (Dark/Light mode), and interactive charting.

---

## 4. CURRENT ARCHITECTURE (WHERE WE ARE NOW)

| Layer | Responsibility | Implementation |
| :--- | :--- | :--- |
| **Data Storage** | Persistence | CSV Files in `backend/data/` |
| **Transformation** | Math & Shaping | Python (`compute.py`) |
| **API Layer** | Routing | FastAPI Modular Routers |
| **Interface** | Presentation | React / ECharts / Tailwind |

**Key Calculation Logic:**
- **ACWR**: Acute (7-day) vs Chronic (28-day) workload ratio.
- **Readiness**: Combined score based on HR, HRV, and Load trends.
- **Flags**: Automatic tagging (Optimal, Overtraining, Under-recovery) based on statistical thresholds.

---

## 5. THE NEXT FRONTIER: POSTGRES MIGRATION
We are currently transitioning from **File-Based (CSV)** to **Database-Driven (Postgres)** storage. 

**Objectives for this stage:**
1. **Schema Design**: Translating `athletes.csv` and session-specific CSVs into a relational schema.
2. **Object Relational Mapping (ORM)**: Integrating SQLAlchemy or SQLModel into the FastAPI backend.
3. **Data Ingestion**: Creating scripts to migrate existing historical CSV data into the database.
4. **Query Optimization**: Leveraging SQL for aggregations that are currently done in-memory via Python/Pandas-like logic.

---

## 6. KEY FILE DIRECTORY REFERENCE
- `backend/main.py`: API entry point.
- `backend/core/compute.py`: The "Brain" (ACWR, Weekly stats, Chart shaping).
- `backend/core/data.py`: The current CSV interface.
- `backend/routers/`: Domain-specific API logic.
- `src/utils/dataService.js`: The frontend gateway to the API.
- `src/components/dashboard/`: Primary visualization components.
