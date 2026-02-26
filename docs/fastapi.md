# FastAPI Implementation

**Page Owner:** Enhance Engineering Team  
**Status:** ✅ Complete  
**Last Updated:** February 2026  
**Parent Page:** [Backend Development](./backend_development.md)

---

## Overview

This page details all changes introduced during the migration from a pure-frontend model to a **modular FastAPI backend**. The backend is responsible for reading CSV data, performing all computations, and serving chart-ready JSON to the frontend.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Backend Framework | FastAPI | Latest |
| Server | Uvicorn | Latest |
| Data Processing | Python Standard Library (`csv`, `datetime`) | 3.10+ |
| Frontend API Client | `fetch` (native browser API) | — |

---

## Backend Directory Structure

```
backend/
├── main.py                ← App entry point, CORS config, router registration
├── core/
│   ├── __init__.py
│   ├── data.py            ← CSV reading, date parsing, date-range filtering
│   └── compute.py         ← All data transformations (Python replacement of JS utilities)
└── routers/
    ├── __init__.py
    ├── athletes.py        ← GET /athletes
    ├── dashboard.py       ← GET /dashboard/overview, /{id}, /{id}/comparison
    ├── group.py           ← GET /group/summary
    ├── profiles.py        ← GET /profiles/summary
    └── reports.py         ← GET /reports/summary, GET /reports/{id}
```

---

## File-by-File Changes

---

### `backend/main.py` — App Entry Point

**What it does:**
- Initialises the FastAPI application
- Registers CORS middleware to allow the Vite dev server (port 5173) to call the API
- Registers all 5 routers with their URL prefixes
- Exposes `GET /health` for uptime checking

**Key implementation:**
```python
from routers import athletes, dashboard, group, profiles, reports

app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)

app.include_router(athletes.router)
app.include_router(dashboard.router)
app.include_router(group.router)
app.include_router(profiles.router)
app.include_router(reports.router)
```

**Run command:**
```bash
python backend/main.py
```
This starts Uvicorn on `http://0.0.0.0:8000` with hot-reload enabled.

---

### `backend/core/data.py` — Data Access Layer

Replaces: `csvParser.js` (date parsing and filtering portions)

**Functions:**

| Function | Purpose |
|---|---|
| `parse_session_date(session)` | Parses `YYYYMMDD_HHMMSS` string → `datetime.date` |
| `get_session_hour(session)` | Extracts the hour integer from a session string |
| `get_athletes()` | Reads `athletes.csv` and returns a list of dicts |
| `get_athlete_by_id(id)` | Looks up an athlete from the registry |
| `read_athlete_csv(filename)` | Reads an athlete's session CSV; adds `date` and `session_hour_parsed` fields to each row |
| `filter_by_date_range(rows, start, end)` | Filters rows to a `[start, end]` date range (inclusive). Returns all rows if either bound is `None` |
| `pf(val, default)` | Safe float parser — returns `default` on any null/empty value |

**Example — date parsing:**
```python
def parse_session_date(session: str) -> Optional[date]:
    date_str = session.split("_")[0]   # "20250307_002647" → "20250307"
    return datetime.strptime(date_str, "%Y%m%d").date()
```

---

### `backend/core/compute.py` — Computation Engine

Replaces: `chartDataPrep.js` + statistical functions from `csvParser.js`

This is the core of the backend. All 16 functions are listed below with their JS counterparts:

| Python Function | JS Equivalent | Output |
|---|---|---|
| `prepare_hr(rows)` | `prepareHeartRateData()` | `[{date, avg_hr, min_hr, max_hr}]` |
| `prepare_training(rows)` | `prepareTrainingData()` | `[{date, training_load, training_intensity}]` |
| `prepare_hrv(rows)` | `prepareHRVData()` | `[{date, sdnn, rmssd, pnn50}]` |
| `prepare_oxygen_debt(rows)` | `prepareOxygenDebtData()` | `[{date, epoc_total, epoc_peak}]` |
| `prepare_energy(rows)` | `prepareEnergyData()` | `[{date, ee_men}]` |
| `prepare_movement(rows)` | `prepareMovementData()` | `[{date, movement_load, movement_load_intensity}]` |
| `prepare_oxygen_consumption(rows)` | `prepareOxygenConsumptionData()` | `[{date, vo2, vo2_max}]` |
| `prepare_zones(rows)` | `prepareZoneDistData()` | `[{date, zone_0_pct … zone_5_pct}]` |
| `prepare_recovery(rows)` | `prepareRecoveryData()` | `[{date, recovery_beats}]` |
| `prepare_acwr(rows)` | `prepareACWRData()` | `[{date, acute_load, chronic_load, acwr}]` |
| `prepare_trends(rows)` | `prepareTrainingTrendsData()` | `[{date, load, acwr, monotony, strain}]` |
| `prepare_summary(rows)` | `prepareSummaryData()` | `{readiness, acwr, loadStatus, flags}` |
| `prepare_monthly(rows)` | `prepareMonthlyStats()` | Monthly aggregated object |
| `prepare_weekly(rows)` | `prepareWeeklyStats()` | Weekly zone durations in minutes |
| `get_athlete_summary(rows, meta)` | `getAthleteSummary()` | Athlete card data |
| `calc_metric_stats(rows, key)` | `calculateMetricStats()` | `{avg, min, max, latest, trend}` |

**Zone duration conversion:**  
The raw CSV columns `zone_0_d` … `zone_5_d` store zone durations in **milliseconds**. The backend converts these to **minutes** for all charts:
```python
ms_to_min = lambda ms: round(ms / 60000)
```

**Readiness Score formula (replicated from JS):**
```python
rmssd_score  = min(100, (rmssd / 60) * 100)
sdnn_score   = min(100, (sdnn / 140) * 100)
hrv_score    = rmssd_score * 0.4 + sdnn_score * 0.3
load_balance = max(0, 100 - abs(1.0 - acwr_val) * 100)
readiness    = round(hrv_score * 0.7 + load_balance * 0.3)
```

---

## API Endpoints

### 1. `GET /athletes`
**Router:** `routers/athletes.py`  
**Purpose:** Returns the full athlete registry.

**Response:**
```json
[
  { "id": "AEH-001", "name": "Ajay D", "age": "24", "sport": "Athletics", "height": "175", "weight": "68", "file": "Ajay D.csv" }
]
```

---

### 2. `GET /dashboard/overview`
**Router:** `routers/dashboard.py`  
**Purpose:** Team-level snapshot for the **AnalyticsOverview** component (shown when no individual athlete is selected on the Dashboard page).

**Response:**
```json
[
  { "id": "AEH-001", "name": "Ajay D", "img": "...", "acwr": 1.0, "avg_hr": 142.3, "rest_hr": 52.0, "rmssd": 38.5, "training_load": 310.0, "zones": { "z0": 5.2, "z1": 12.4, ... } }
]
```

---

### 3. `GET /dashboard/{athlete_id}`
**Router:** `routers/dashboard.py`  
**Purpose:** Full dataset for a single athlete's dashboard tabs (Overview, Training, Readiness).

**Query Params:** `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` (optional — returns all sessions if omitted)

**Response Structure:**
```json
{
  "athlete":       { "id", "name", "age", "height", "weight", "sport", "gender", "img" },
  "summary":       { "latestWellness", "acwr", "loadStatus", "redFlags", "yellowFlags", "latestHR", "latestRMSSD" },
  "athleteSummary":{ "totalSessions", "trainingSessions", "readinessSessions", "sessionStart", "sessionEnd", "avgHR", "avgRMSSD" },
  "charts": {
    "hr":                  [{ "date", "avg_hr", "min_hr", "max_hr" }],
    "training":            [{ "date", "training_load", "training_intensity" }],
    "hrv":                 [{ "date", "sdnn", "rmssd", "pnn50" }],
    "oxygen_debt":         [{ "date", "epoc_total", "epoc_peak" }],
    "energy":              [{ "date", "ee_men" }],
    "movement":            [{ "date", "movement_load", "movement_load_intensity" }],
    "oxygen_consumption":  [{ "date", "vo2", "vo2_max" }],
    "zones":               [{ "date", "zone_0_pct" ... "zone_5_pct" }],
    "recovery":            [{ "date", "recovery_beats" }],
    "acwr":                [{ "date", "acute_load", "chronic_load", "acwr" }],
    "trainingTrends":      [{ "date", "load", "acwr", "monotony", "strain" }],
    "monthly":             [{ "date", "load", "hrv", "zones", "hr", "acwr", "movement" }],
    "weekly":              [{ "date", "sessionCount", "zones" }]
  }
}
```

---

### 4. `GET /dashboard/{athlete_id}/comparison`
**Router:** `routers/dashboard.py`  
**Purpose:** Serves the **Comparison Tab**. Supports two modes:

| Mode | Query Params | What it returns |
|---|---|---|
| Athlete vs Athlete | `?target_id=AEH-002` | Charts for a different athlete |
| Period vs Period | `?secondary_start=&secondary_end=` | Charts for the same athlete in a different date window |

**Response:** Same `{ athlete, athleteSummary, charts }` shape as above.

---

### 5. `GET /group/summary`
**Router:** `routers/group.py`  
**Purpose:** Latest metrics per athlete for the **Group Dashboard** metric cards and tables.

**Response:**
```json
[
  { "id", "name", "img", "sport", "sessionDate", "avg_hr", "training_load", "training_intensity", "acwr", "epoc_total", "rmssd", "zones" }
]
```

---

### 6. `GET /profiles/summary`
**Router:** `routers/profiles.py`  
**Purpose:** Athlete listing for the **Profiles** page. Includes a server-computed `flag`.

**Flag Logic:**
- ACWR > 1.3 → `"Overtraining"`
- ACWR < 0.8 → `"Undertraining"`
- Otherwise → `"Optimal"`

**Response:**
```json
[
  { "id", "name", "img", "sport", "sessionDate", "acwr", "avg_hr", "rest_hr", "rmssd", "training_load", "flag" }
]
```

---

### 7. `GET /reports/summary`
**Router:** `routers/reports.py`  
**Purpose:** Lightweight listing for the **Reports** table.

---

### 8. `GET /reports/{athlete_id}`
**Router:** `routers/reports.py`  
**Purpose:** Full session history for a single athlete. Used by the **ReportModal** PDF generator.

**Response:** Array of all sessions with all 22 metric fields (HR, HRV, zones, EPOC, VO2, movement, ACWR, etc.).

---

## Frontend Changes

### `src/utils/dataService.js` — Complete Rewrite

This file no longer imports any local data. All exports are async API-fetch functions:

| Export | Endpoint | Used By |
|---|---|---|
| `fetchAthletes()` | `GET /athletes` | Dashboard, DashboardHeader |
| `fetchDashboardOverview()` | `GET /dashboard/overview` | AnalyticsOverview |
| `fetchAthleteData(athlete, start, end)` | `GET /dashboard/{id}` | Dashboard (all tabs) |
| `fetchComparison(id, opts)` | `GET /dashboard/{id}/comparison` | ComparisonTab |
| `fetchGroupSummary()` | `GET /group/summary` | GroupDashboard |
| `fetchTeamSummary()` | `GET /profiles/summary` | Profiles |
| `fetchReportsSummary()` | `GET /reports/summary` | Reports |
| `fetchReportDetail(id)` | `GET /reports/{id}` | ReportModal |

### `src/pages/Dashboard.jsx` — Refactored
- Removed all calls to `chartDataPrep.js` functions (`prepareData`, `prepareHeartRateData`, etc.)
- Now uses two API calls:  
  1. `fetchDashboardOverview()` on initial load → feeds `AnalyticsOverview`  
  2. `fetchAthleteData(athlete, start, end)` when an athlete is selected → feeds all 4 tabs
- Pass-through date params wired to `?start_date=` and `?end_date=` query params

### `src/pages/GroupDashboard.jsx` — Updated
- Replaced `fetchTeamSummary()` + `fetchAthletes()` with single `fetchGroupSummary()` call
- Added `athletesList` prop drilling to `MetricCard` component (bug fix)

### `src/pages/Profiles.jsx` — Updated
- Removed raw `fetch("http://localhost:8000/athletes")` hardcoded call
- Uses `fetchTeamSummary()` which maps to `/profiles/summary`

### `src/pages/Reports.jsx` — Updated
- Replaced `fetchAthleteData()` modal fetch with `fetchReportDetail(athlete.id)`
- Replaced `fetchTeamSummary()` + `fetchAthletes()` with single `fetchReportsSummary()`

---

## Bugs Fixed During Migration

| Bug | Cause | Fix |
|---|---|---|
| Blank white page on startup | Stale static imports in `dataService.js` and `Profiles.jsx` | Removed all static `athletes` imports |
| Group Dashboard blank | `MetricCard` used `athletesList` without receiving it as a prop | Added `athletesList` to MetricCard props |
| Athlete card missing session counts | `getAthleteSummary()` only ran client-side | Ported to `get_athlete_summary()` in Python |
| Time period filter crashes page | Filtering ran on unparsed date strings | Backend handles filtering with native Python `datetime.date` objects |
| Wrong zone chart values | JS divided by `60000` but Python backend was computing totals from raw CSV | Explicitly applied `ms_to_min = lambda ms: round(ms / 60000)` in Python aggregation |
| Import error on startup (`..core`) | Relative imports fail when running `python backend/main.py` from project root | Changed all router imports from `from ..core` to `from core` |

---

## Running the Application

```bash
# Terminal 1 — Start backend
python backend/main.py

# Terminal 2 — Start frontend
npm run dev
```

**Verify backend health:**
```
GET http://localhost:8000/health
→ { "status": "ok", "version": "2.0" }
```

**Interactive API docs (auto-generated by FastAPI):**
```
http://localhost:8000/docs
```
