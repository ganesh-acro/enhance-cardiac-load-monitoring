# Backend Migration Report: From Frontend-Only to Modular FastAPI

This document explains the transition of the **Enhance Cardiac Monitoring** application from a pure frontend data processing model to a robust, modular FastAPI backend.

---

## 1. Architectural Evolution

### Phase 1: Pure Frontend (Legacy)
In the initial version, the frontend was "thick"—it handled everything from data fetching to complex statistical computations.

*   **Data Source**: Static JSON files (`dashboardData.js`) or raw CSVs parsed in the browser via `PapaParse`.
*   **Transformation Layer**: Two heavy JS files:
    *   `csvParser.js`: Responsible for date parsing, filtering, and basic session stats.
    *   `chartDataPrep.js`: Responsible for "shaping" data specifically for Recharts/ECharts (weekly/monthly aggregation, zone calculations, ACWR trends).
*   **Problem**: As the data grew (200+ sessions per athlete), the browser's performance dipped, and managing filter logic across multiple pages became inconsistent.

### Phase 2: Modular Backend (Current)
We have now migrated all "business logic" and data heavy-lifting to a Python backend.

*   **The "Brain" (`core/compute.py`)**: This is the Python equivalent of the old JS utility files. It performs all mathematical aggregations and readiness score calculations on the server.
*   **The "Gatekeeper" (`core/data.py`)**: Standardizes how CSVs are read, ensuring dates are parsed consistently using a unified `parse_session_date` helper.
*   **Modular Routers**: Logic is split into per-page routers to keep the code maintainable.

---

## 2. Logic Redistribution

The following table shows how key responsibilities shifted:

| Responsibility | Old JS Implementation | New Python Implementation |
| :--- | :--- | :--- |
| **Date Parsing** | `parseISO` in components | `core.data.parse_session_date` |
| **Zone Conversion** | `prepareWeeklyStats` (JS) | `core.compute.prepare_weekly` |
| **Readiness Scores** | `getAthleteSummary` (JS) | `core.compute.prepare_summary` |
| **Date Filtering** | `filterByDateRange` (JS) | `core.data.filter_by_date_range` |
| **Chart Shaping** | 10+ functions in `chartDataPrep.js` | 10+ functions in `core.compute` |

---

## 3. The API Layer: Page-by-Page Breakdown

The backend is now structured to provide **"Chart-Ready" JSON**. The frontend no longer calculates anything; it simply receives a JSON object and passes it to the chart components.

### 📊 Dashboard Page (`/dashboard`)
*   `GET /dashboard/overview`: Returns team-wide latest metrics for the **AnalyticsOverview** component.
*   `GET /dashboard/{id}`: Returns a single, rich JSON object containing:
    *   **Athlete Bio**: Profile details.
    *   **Summary**: Calculated ACWR status, load status, and flag counts.
    *   **Charts**: 13 pre-formatted arrays (HR, HRV, Zones, EPOC, etc.) ready for display.
*   `GET /dashboard/{id}/comparison`: Specifically handles the **Comparison Tab**, allowing "Athlete vs Athlete" or "Period vs Period" analysis.

### 👥 Group Dashboard Page (`/group`)
*   `GET /group/summary`: Returns latest metrics specifically formatted for the Group Table and Metric Zoom cards.

### 🖼️ Profiles Page (`/profiles`)
*   `GET /profiles/summary`: Returns a light-weight listing of athletes with their latest status **Flag** (Optimal/Overtraining) already determined by the server.

### 📄 Reports Page (`/reports`)
*   `GET /reports/summary`: Fast table listing.
*   `GET /reports/{id}`: Returns the **Full History** of an athlete for PDF export.

---

## 4. Why This Is Better

1.  **Consistency**: The "Readiness Score" or "ACWR" flag is calculated in ONE place (Python). No more "Optimal" in one page and "Overtraining" in another.
2.  **Performance**: The frontend `Dashboard.jsx` is now ~100 lines lighter because it doesn't have to call data transformation functions.
3.  **Scalability**: Adding a new metric (e.g., Blood Oxygen) now only requires a single Python function update in `compute.py` and a new key in the API response.
4.  **Date Filtering**: By moving filtering to the backend (`?start_date=YYYY-MM-DD`), we only send the necessary data over the network, making the app much faster on mobile/slow connections.

---

## 5. Summary of Files Created/Modified

| File | Purpose |
| :--- | :--- |
| [main.py](file:///c:/Users/1/Desktop/enhance/backend/main.py) | Entry point that wires all routers and enables CORS. |
| [data.py](file:///c:/Users/1/Desktop/enhance/backend/core/data.py) | Lower-level data access (CSV parsing & filtering). |
| [compute.py](file:///c:/Users/1/Desktop/enhance/backend/core/compute.py) | The math engine (Shaping data for charts). |
| [dataService.js](file:///c:/Users/1/Desktop/enhance/src/utils/dataService.js) | Frontend bridge that communicates with the new API. |
