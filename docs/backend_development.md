# Backend Development

**Page Owner:** Enhance Engineering Team  
**Status:** ✅ Complete  
**Last Updated:** February 2026  
**Child Pages:** [FastAPI Implementation](./fastapi.md)

---

## Overview

This page documents the data architecture of the **Enhance Cardiac Monitoring** application, covering Phase 1 (pure frontend) and the transition context that led to the FastAPI backend. The FastAPI-specific changes are documented in the child page.

---

## Phase 1: Frontend-Only Architecture

In the initial version of the application, there was **no backend server**. All data was sourced, parsed, and transformed entirely within the browser using JavaScript.

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌──────────────┐   ┌────────────────┐   ┌──────────────┐  │
│  │ Static JSON  │ → │  csvParser.js  │ → │ chartData    │  │
│  │ CSV Files    │   │  (parse/filter)│   │ Prep.js      │  │
│  └──────────────┘   └────────────────┘   │ (transform)  │  │
│                                          └──────┬───────┘  │
│                                                 │           │
│                                          ┌──────▼───────┐  │
│                                          │   React JSX  │  │
│                                          │  Components  │  │
│                                          └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Frontend Files (Legacy)

### `src/data/dashboardData.js`
The original static data file. It exported hardcoded athlete metadata (names, ages, sports) directly as JavaScript objects. There was no network call involved — data was baked into the bundle.

```js
// Example of how data was structured
export const athletes = [
  { id: "AEH-001", name: "Ajay D", age: 24, sport: "Athletics" },
  ...
]
```

### `src/utils/csvParser.js`
This file was responsible for four things:

| Function | Responsibility |
|---|---|
| `parseCSV()` | Used PapaParse library to read raw CSV text from the browser |
| `parseSessionDate(session)` | Parsed the `YYYYMMDD_HHMMSS` session string into a JS `Date` object |
| `filterByDateRange(data, start, end)` | Filtered sessions using `date-fns` `isWithinInterval` |
| `calculateMetricStats(data, key)` | Calculated avg, min, max, and trend direction for any metric column |
| `getAthleteSummary(data, meta)` | Computed an athlete's full card: session count by type (Training vs Readiness), start/end dates, avg HR, avg RMSSD |

The readiness classification logic was embedded here:
```js
// Session type classified by hour of session start time
if (hour < 10) readinessSessions++;
else trainingSessions++;
```

### `src/utils/chartDataPrep.js`
This was the most complex utility. It contained 10+ functions to transform raw session arrays into specific chart-consumable formats:

| Function | Output Format | Used By |
|---|---|---|
| `prepareHeartRateData()` | `[{date, avg_hr, min_hr, max_hr}]` | Heart rate area chart |
| `prepareTrainingData()` | `[{date, training_load, training_intensity}]` | Training load bar chart |
| `prepareHRVData()` | `[{date, sdnn, rmssd, pnn50}]` | HRV multi-line chart |
| `prepareOxygenDebtData()` | `[{date, epoc_total, epoc_peak}]` | EPOC chart |
| `prepareEnergyData()` | `[{date, ee_men}]` | Energy expenditure chart |
| `prepareMovementData()` | `[{date, movement_load, movement_load_intensity}]` | Movement chart |
| `prepareACWRData()` | `[{date, acute_load, chronic_load, acwr}]` | ACWR combined chart |
| `prepareZoneDistData()` | `[{date, zone_0_pct…zone_5_pct}]` | Zone distribution chart |
| `prepareMonthlyStats()` | Monthly aggregated HR, HRV, Zones, ACWR, Movement | Monthly overview charts |
| `prepareWeeklyStats()` | Weekly zone durations in minutes | Training load tab zone chart |
| `prepareSummaryData()` | Readiness score, ACWR flag, red/yellow flag count | Overview tab cards |


### `src/utils/dataService.js` (Legacy)
Originally imported static data and CSV parsing functions directly:
```js
import { parseCSV } from './csvParser'
import { athletes } from '../data/dashboardData'
// No actual API calls
```

---

## Data Flow (Phase 1)

```
User opens Dashboard
       │
       ▼
Dashboard.jsx loads CSV from /public/data/*.csv
       │
       ▼
csvParser.js parses raw CSV text → Array of row objects
       │
       ▼
chartDataPrep.js transforms rows → Chart-ready arrays
       │
       ▼
FeatureCharts.jsx / AnalyticsOverview.jsx renders charts
```

### Date filtering was entirely client-side:
1. User selects a date range in `DashboardHeader.jsx`
2. `filterByDateRange()` was called in the component
3. `prepareData()` was re-called on the filtered subset
4. React re-rendered the charts with new data

---

## Problems with the Frontend-Only Model

| Problem | Impact |
|---|---|
| **No single source of truth** | Readiness scores differed between pages because each page ran its own calculation |
| **Static imports** | Hardcoded `athletes` array in `dashboardData.js` caused crashes when new athletes were added |
| **Bundle size** | All CSV data was bundled at build time, making the initial load heavy |
| **Inconsistent keys** | Some components used `avgHR`, others used `avg_hr`, leading to `undefined` rendering |
| **No reusability** | Date filtering, session classification, and aggregation logic was duplicated or tightly coupled to components |
| **Reports page blank** | `Reports.jsx` and `Profiles.jsx` both had stale imports from removed static modules |

---

## Transition Decision

After identifying these structural issues, the decision was made to:

1. Introduce a **Python/FastAPI backend** to serve pre-computed, chart-ready data
2. Standardize all data keys to **snake_case** per Python convention
3. Move all computations out of the browser and into **server-side Python functions**
4. Give each page its own **dedicated API endpoint**

See the child page: **[FastAPI Implementation](./fastapi.md)** for all changes made during the migration.
