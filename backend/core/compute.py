"""
core/compute.py — All data transformations (Python equivalents of chartDataPrep.js + csvParser.js).
"""
from datetime import date, timedelta
from typing import List, Dict, Optional, Any
from collections import defaultdict
from .data import pf


# ---------------------------------------------------------------------------
# Format helpers
# ---------------------------------------------------------------------------

def fmt_date(d: date) -> str:
    """'Mar 07' — matches JS format(date, 'MMM dd')"""
    return d.strftime("%b %d")


def fmt_month(d: date) -> str:
    """'Mar 2025' — matches JS format(date, 'MMM yyyy')"""
    return d.strftime("%b %Y")


def fmt_month_key(d: date) -> str:
    """'2025-03' for sorting."""
    return d.strftime("%Y-%m")


def week_start(d: date) -> date:
    """Monday of the week containing d."""
    return d - timedelta(days=d.weekday())


def week_end(d: date) -> date:
    return week_start(d) + timedelta(days=6)


def fmt_week_label(d: date) -> str:
    s, e = week_start(d), week_end(d)
    return f"{s.strftime('%b %d')} - {e.strftime('%b %d')}"


# ---------------------------------------------------------------------------
# 1. Heart Rate
# ---------------------------------------------------------------------------

def prepare_hr(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareHeartRateData. Returns [{date, avg_hr, min_hr, max_hr}]"""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "avg_hr": pf(r.get("avg_hr")),
            "min_hr": pf(r.get("min_hr")),
            "max_hr": pf(r.get("max_hr")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 2. Training Load & Intensity
# ---------------------------------------------------------------------------

def prepare_training(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareTrainingData."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "training_load": pf(r.get("training_load")),
            "training_intensity": pf(r.get("training_intensity")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 3. HRV
# ---------------------------------------------------------------------------

def prepare_hrv(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareHRVData."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "sdnn": pf(r.get("sdnn")),
            "rmssd": pf(r.get("rmssd")),
            "pnn50": pf(r.get("pnn50")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 4. Oxygen Debt (EPOC)
# ---------------------------------------------------------------------------

def prepare_oxygen_debt(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareOxygenDebtData."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "epoc_total": pf(r.get("epoc_total")),
            "epoc_peak": pf(r.get("epoc_peak")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 5. Energy Expenditure
# ---------------------------------------------------------------------------

def prepare_energy(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareEnergyData."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "ee_men": pf(r.get("ee_men")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 6. Movement Load
# ---------------------------------------------------------------------------

def prepare_movement(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareMovementData."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "movement_load": pf(r.get("movement_load")),
            "movement_load_intensity": pf(r.get("movement_load_intensity")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 7. Oxygen Consumption (VO2)
# ---------------------------------------------------------------------------

def prepare_oxygen_consumption(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareOxygenConsumptionData."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "vo2": pf(r.get("vo2")),
            "vo2_max": pf(r.get("vo2_max")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 8. Zone Distribution (Percentages)
# ---------------------------------------------------------------------------

def prepare_zones(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareZoneDistData."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "zone_0_pct": pf(r.get("zone_0_pct")),
            "zone_1_pct": pf(r.get("zone_1_pct")),
            "zone_2_pct": pf(r.get("zone_2_pct")),
            "zone_3_pct": pf(r.get("zone_3_pct")),
            "zone_4_pct": pf(r.get("zone_4_pct")),
            "zone_5_pct": pf(r.get("zone_5_pct")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 9. Recovery Beats
# ---------------------------------------------------------------------------

def prepare_recovery(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareRecoveryData."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "recovery_beats": pf(r.get("recovery_beats")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 10. ACWR
# ---------------------------------------------------------------------------

def prepare_acwr(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareACWRData."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "acute_load": pf(r.get("acute_load")),
            "chronic_load": pf(r.get("chronic_load")),
            "acwr": pf(r.get("acwr")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 11. Training Trends
# ---------------------------------------------------------------------------

def prepare_trends(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareTrainingTrendsData. Reads all values directly from CSV."""
    return [
        {
            "date": fmt_date(r["date"]),
            "load": pf(r.get("training_load")),
            "acwr": pf(r.get("acwr")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 12. Summary Data for Overview card
# ---------------------------------------------------------------------------

def prepare_summary(rows: List[Dict]) -> Optional[Dict]:
    """
    Returns the latest session's pre-computed values directly from the CSV.
    No derived formulas — the CSV already contains acwr, session_quality, etc.
    """
    if not rows:
        return None
    latest = rows[-1]
    acwr_val = pf(latest.get("acwr"))

    return {
        "acwr": f"{acwr_val:.2f}",
        "latestWellness": pf(latest.get("session_quality")),
        "latestHR": pf(latest.get("avg_hr")),
        "latestRMSSD": pf(latest.get("rmssd")),
        "acuteLoad": pf(latest.get("acute_load")),
        "chronicLoad": pf(latest.get("chronic_load")),
        "loadStatus": "High" if acwr_val > 1.3 else ("Low" if acwr_val < 0.8 else "Optimal"),
        "redFlags": 1 if acwr_val > 1.3 else 0,
        "yellowFlags": 1 if acwr_val < 0.8 else 0,
        "latestDate": latest["date"].isoformat() if latest.get("date") else None,
    }


# ---------------------------------------------------------------------------
# 13. Monthly Aggregated Stats
# ---------------------------------------------------------------------------

def prepare_monthly(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareMonthlyStats."""
    monthly: Dict[str, Any] = {}

    for r in rows:
        d = r["date"]
        key = fmt_month_key(d)
        label = fmt_month(d)

        if key not in monthly:
            monthly[key] = {
                "date": label, "rawDate": key,
                "sessionCount": 0,
                "totalLoad": 0,
                "hrvSum": 0, "hrvCount": 0,
                "z0": 0, "z1": 0, "z2": 0, "z3": 0, "z4": 0, "z5": 0,
                "minHrSum": 0, "maxHrSum": 0, "avgHrSum": 0,
                "acwrSum": 0,
                "movLoad": 0, "movIntSum": 0,
            }

        m = monthly[key]
        m["sessionCount"] += 1
        m["totalLoad"] += pf(r.get("training_load"))

        hrv_val = pf(r.get("rmssd"), -1)
        if hrv_val > 0:
            m["hrvSum"] += hrv_val
            m["hrvCount"] += 1

        # Zone durations (milliseconds, convert to minutes later)
        m["z0"] += pf(r.get("zone_0_d"))
        m["z1"] += pf(r.get("zone_1_d"))
        m["z2"] += pf(r.get("zone_2_d"))
        m["z3"] += pf(r.get("zone_3_d"))
        m["z4"] += pf(r.get("zone_4_d"))
        m["z5"] += pf(r.get("zone_5_d"))

        m["minHrSum"] += pf(r.get("min_hr"))
        m["maxHrSum"] += pf(r.get("max_hr"))
        m["avgHrSum"] += pf(r.get("avg_hr"))
        m["acwrSum"] += pf(r.get("acwr"))
        m["movLoad"] += pf(r.get("movement_load"))
        m["movIntSum"] += pf(r.get("movement_load_intensity"))

    ms_to_min = lambda ms: round(ms / 60000)

    result = []
    for m in monthly.values():
        c = m["sessionCount"] or 1
        result.append({
            "date": m["date"],
            "rawDate": m["rawDate"],
            "sessionCount": m["sessionCount"],
            "load": round(m["totalLoad"]),
            "hrv": round(m["hrvSum"] / m["hrvCount"], 1) if m["hrvCount"] > 0 else 0,
            "zones": {
                "z0": ms_to_min(m["z0"]),
                "z1": ms_to_min(m["z1"]),
                "z2": ms_to_min(m["z2"]),
                "z3": ms_to_min(m["z3"]),
                "z4": ms_to_min(m["z4"]),
                "z5": ms_to_min(m["z5"]),
            },
            "hr": {
                "min": round(m["minHrSum"] / c, 1),
                "max": round(m["maxHrSum"] / c, 1),
                "avg": round(m["avgHrSum"] / c, 1),
            },
            "acwr": round(m["acwrSum"] / c, 2),
            "movement": {
                "load": round(m["movLoad"]),
                "intensity": round(m["movIntSum"] / c, 1),
            },
        })

    result.sort(key=lambda x: x["rawDate"])
    return result


# ---------------------------------------------------------------------------
# 14. Weekly Zone Stats
# ---------------------------------------------------------------------------

def prepare_weekly(rows: List[Dict]) -> List[Dict]:
    """Replaces prepareWeeklyStats. Returns weekly zone durations in minutes."""
    weekly: Dict[str, Any] = {}

    for r in rows:
        d = r["date"]
        ws = week_start(d)
        key = ws.isoformat()

        if key not in weekly:
            weekly[key] = {
                "weekKey": key,
                "weekLabel": fmt_week_label(d),
                "sessionCount": 0,
                "z0": 0, "z1": 0, "z2": 0, "z3": 0, "z4": 0, "z5": 0,
            }

        w = weekly[key]
        w["sessionCount"] += 1
        w["z0"] += pf(r.get("zone_0_d"))
        w["z1"] += pf(r.get("zone_1_d"))
        w["z2"] += pf(r.get("zone_2_d"))
        w["z3"] += pf(r.get("zone_3_d"))
        w["z4"] += pf(r.get("zone_4_d"))
        w["z5"] += pf(r.get("zone_5_d"))

    ms_to_min = lambda ms: round(ms / 60000)

    result = [
        {
            "date": w["weekLabel"],
            "rawDate": w["weekKey"],
            "sessionCount": w["sessionCount"],
            "zones": {
                "z0": ms_to_min(w["z0"]),
                "z1": ms_to_min(w["z1"]),
                "z2": ms_to_min(w["z2"]),
                "z3": ms_to_min(w["z3"]),
                "z4": ms_to_min(w["z4"]),
                "z5": ms_to_min(w["z5"]),
            },
        }
        for w in weekly.values()
    ]
    result.sort(key=lambda x: x["rawDate"])
    return result


# ---------------------------------------------------------------------------
# 15. Athlete Summary Card (replaces getAthleteSummary)
# ---------------------------------------------------------------------------

def calc_metric_stats(rows: List[Dict], key: str) -> Dict:
    """Replaces calculateMetricStats."""
    values = [pf(r.get(key)) for r in rows if r.get(key) not in (None, "")]
    values = [v for v in values if v > 0]
    if not values:
        return {"avg": 0, "min": 0, "max": 0, "latest": 0, "trend": "stable"}
    avg = sum(values) / len(values)
    latest = values[-1]
    return {
        "avg": round(avg, 2),
        "min": round(min(values), 2),
        "max": round(max(values), 2),
        "latest": round(latest, 2),
        "trend": "up" if latest > avg else ("down" if latest < avg else "stable"),
    }


def get_athlete_summary(rows: List[Dict], meta: Dict) -> Dict:
    """Replaces getAthleteSummary. Produces the athlete card data."""
    name = meta.get("name", "N/A")
    age = meta.get("age", "N/A")
    height = meta.get("height", "N/A")
    weight = meta.get("weight", "N/A")
    sport = meta.get("sport", "N/A")
    gender = meta.get("gender", "M")

    if not rows:
        return {
            "name": name, "age": age, "height": height, "weight": weight,
            "sport": sport, "gender": gender,
            "sessionStart": None, "sessionEnd": None,
            "totalSessions": 0, "trainingSessions": 0, "readinessSessions": 0,
            "avgHR": 0, "avgRMSSD": 0,
        }

    dates = [r["date"] for r in rows]
    session_start = dates[0].strftime("%b %d, %Y")
    session_end = dates[-1].strftime("%b %d, %Y")

    training_sessions = 0
    readiness_sessions = 0
    for r in rows:
        st = r.get("session_type", "")
        hour = r.get("session_hour_parsed")
        if st == "Training":
            training_sessions += 1
        elif st in ("Readiness", "Light Activity"):
            readiness_sessions += 1
        elif hour is not None:
            if hour < 10:
                readiness_sessions += 1
            else:
                training_sessions += 1

    hr_stats = calc_metric_stats(rows, "avg_hr")
    rmssd_stats = calc_metric_stats(rows, "rmssd")

    return {
        "name": name, "age": age, "height": height, "weight": weight,
        "sport": sport, "gender": gender,
        "sessionStart": session_start,
        "sessionEnd": session_end,
        "totalSessions": len(rows),
        "trainingSessions": training_sessions,
        "readinessSessions": readiness_sessions,
        "avgHR": hr_stats["avg"],
        "avgRMSSD": rmssd_stats["avg"],
    }


# ---------------------------------------------------------------------------
# 16. Build full charts payload (used by dashboard endpoint)
# ---------------------------------------------------------------------------

def build_charts(rows: List[Dict]) -> Dict:
    """Build the complete chart-ready payload for all dashboard tabs."""
    return {
        "hr": prepare_hr(rows),
        "training": prepare_training(rows),
        "hrv": prepare_hrv(rows),
        "oxygen_debt": prepare_oxygen_debt(rows),
        "energy": prepare_energy(rows),
        "movement": prepare_movement(rows),
        "oxygen_consumption": prepare_oxygen_consumption(rows),
        "zones": prepare_zones(rows),
        "recovery": prepare_recovery(rows),
        "acwr": prepare_acwr(rows),
        "trainingTrends": prepare_trends(rows),
        "monthly": prepare_monthly(rows),
        "weekly": prepare_weekly(rows),
    }
