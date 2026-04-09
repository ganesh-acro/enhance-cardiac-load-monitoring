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

# ---------------------------------------------------------------------------
# Session-type filters
# ---------------------------------------------------------------------------

def _training_rows(rows: List[Dict]) -> List[Dict]:
    """Return only Training sessions."""
    return [r for r in rows if r.get("session_type") == "Training"]


def _readiness_rows(rows: List[Dict]) -> List[Dict]:
    """Return only Readiness sessions."""
    return [r for r in rows if r.get("session_type") in ("Readiness", "Light Activity")]


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
# 10. Training Effect (Training-only)
# ---------------------------------------------------------------------------

def prepare_training_effect(rows: List[Dict]) -> List[Dict]:
    """Aerobic & Anaerobic Training Effect values per training session."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "aerobic_te_value": pf(r.get("aerobic_te_value")),
            "aerobic_te_comment": r.get("aerobic_te_comment") or "",
            "anaerobic_te_value": pf(r.get("anaerobic_te_value")),
            "anaerobic_te_comment": r.get("anaerobic_te_comment") or "",
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 11. Exercise Duration (Training-only)
# ---------------------------------------------------------------------------

def prepare_exercise_duration(rows: List[Dict]) -> List[Dict]:
    """Exercise duration per training session."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "exercise_duration": pf(r.get("exercise_duration")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 12. Resting HR & HR Std (Readiness-only)
# ---------------------------------------------------------------------------

def prepare_resting_hr(rows: List[Dict]) -> List[Dict]:
    """Resting HR and HR variability (std) from readiness sessions."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "rest_hr": pf(r.get("rest_hr")),
            "hr_std": pf(r.get("hr_std")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 13. HR Recovery 60s (Readiness-only)
# ---------------------------------------------------------------------------

def prepare_hr_recovery(rows: List[Dict]) -> List[Dict]:
    """HR recovery at 60 seconds from readiness sessions."""
    return [
        {
            "date": fmt_date(r["date"]),
            "fullDate": r["date"].isoformat(),
            "hr_recovery_60s": pf(r.get("hr_recovery_60s")),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# 14. ACWR
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
    Returns the latest session's pre-computed values plus classification flags.
    Includes exertion level and training load flag from latest training session.
    """
    from core.flags import classify_training_load, classify_exertion

    if not rows:
        return None
    latest = rows[-1]
    acwr_val = pf(latest.get("acwr"))

    # Classify from latest training session
    training = _training_rows(rows)
    exertion_level = None
    training_load_flag = None
    if training:
        latest_training = training[-1]
        raw_level = classify_exertion(latest_training)["level"]
        # Strip "1 - " prefix for backward-compatible display
        exertion_level = raw_level.split(" - ")[1] if " - " in raw_level else raw_level
        training_load_flag = classify_training_load(latest_training)["flag"]

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
        "exertion_level": exertion_level,
        "training_load_flag": training_load_flag,
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
    training = _training_rows(rows)
    readiness = _readiness_rows(rows)

    return {
        # Training-only metrics
        "training": prepare_training(training),
        "oxygen_debt": prepare_oxygen_debt(training),
        "energy": prepare_energy(training),
        "movement": prepare_movement(training),
        "oxygen_consumption": prepare_oxygen_consumption(training),
        "zones": prepare_zones(training),
        "weekly": prepare_weekly(training),
        "training_effect": prepare_training_effect(training),
        "exercise_duration": prepare_exercise_duration(training),
        # Readiness-only metrics
        "hrv": prepare_hrv(readiness),
        "recovery": prepare_recovery(readiness),
        "resting_hr": prepare_resting_hr(readiness),
        "hr_recovery": prepare_hr_recovery(readiness),
        # Both session types
        "hr": prepare_hr(rows),
        "acwr": prepare_acwr(rows),
        "trainingTrends": prepare_trends(rows),
        "monthly": prepare_monthly(rows),
    }


# ---------------------------------------------------------------------------
# 17. Monthly Performance Flags
# ---------------------------------------------------------------------------

import math as _math


def _safe_mean(values: List[float]) -> Optional[float]:
    """Mean of a list of floats, or None if empty."""
    if not values:
        return None
    return sum(values) / len(values)


def _safe_median(values: List[float]) -> Optional[float]:
    """Median of a list of floats, or None if empty."""
    if not values:
        return None
    s = sorted(values)
    n = len(s)
    if n % 2 == 1:
        return s[n // 2]
    return (s[n // 2 - 1] + s[n // 2]) / 2


def _safe_sd(values: List[float]) -> Optional[float]:
    """Sample standard deviation (ddof=1). Requires >= 2 values."""
    if len(values) < 2:
        return None
    m = sum(values) / len(values)
    variance = sum((x - m) ** 2 for x in values) / (len(values) - 1)
    return _math.sqrt(variance)


def _safe_pct(part: int, total: int) -> float:
    """Percentage rounded to 1 d.p.; 0.0 if total is zero."""
    return round(part / total * 100, 1) if total > 0 else 0.0


# -- Session enrichment (single-pass) --------------------------------------

def _enrich_sessions(rows: List[Dict]) -> List[Dict]:
    """
    Stamp every row with per-session classification results:
      Readiness rows: _readiness_status, _rmssd_sd_30
      Training rows:  _exertion_level, _sub_type, _training_load_flag, _acwr_status, _score
    Mutates rows in place and returns the same list.
    """
    from core.flags import (
        compute_baselines, classify_readiness, classify_exertion,
        classify_training_load, compute_score,
    )

    readiness = _readiness_rows(rows)
    training = _training_rows(rows)

    # Enrich readiness rows
    for r in readiness:
        bl = compute_baselines(readiness, r["date"])
        result = classify_readiness(r, bl)
        r["_readiness_status"] = result["status"]
        r["_rmssd_sd_30"] = result.get("rmssd_sd_30")

    # Enrich training rows
    for t in training:
        ex = classify_exertion(t)
        t["_exertion_level"] = ex["level"]
        t["_sub_type"] = ex["sub_type"]

        tl = classify_training_load(t)
        t["_training_load_flag"] = tl["flag"]
        t["_acwr_status"] = tl["acwr_status"]

        t["_score"] = compute_score(tl["flag"], ex["level"])

    return rows


# -- F1: Readiness Trend (SD-adaptive, month-over-month) -------------------

_F1_SD_FATIGUE_MULT = 0.5
_F1_SD_OVERREACH_MULT = 1.0
_F1_SD_MIN_SESSIONS = 2
_F1_PCT_STABLE_MIN = -5.0
_F1_PCT_FATIGUE_MIN = -10.0


def _flag_readiness_trend(r_curr: List[Dict], r_prev: List[Dict]) -> Dict:
    """
    Compare mean RMSSD between current and previous calendar months.
    Uses athlete's own median Baseline SD as personal noise floor.
    """
    # Current month stats
    curr_rmssd_vals = [pf(r.get("rmssd")) for r in r_curr if r.get("rmssd") not in (None, "", 0)]
    curr_rmssd_vals = [v for v in curr_rmssd_vals if v > 0]
    curr_rmssd = round(_safe_mean(curr_rmssd_vals), 2) if curr_rmssd_vals else None

    # Previous month stats
    prev_rmssd_vals = [pf(r.get("rmssd")) for r in r_prev if r.get("rmssd") not in (None, "", 0)]
    prev_rmssd_vals = [v for v in prev_rmssd_vals if v > 0]
    prev_rmssd = round(_safe_mean(prev_rmssd_vals), 2) if prev_rmssd_vals else None

    # Personal SD from enriched baseline SD values
    sd_vals = [r["_rmssd_sd_30"] for r in r_curr if r.get("_rmssd_sd_30") is not None]
    sd_median = round(_safe_median(sd_vals), 2) if sd_vals else None

    # Readiness status counts
    ready_count = sum(1 for r in r_curr if r.get("_readiness_status") == "READY")
    partial_count = sum(1 for r in r_curr if r.get("_readiness_status") == "PARTIALLY READY")
    notready_count = sum(1 for r in r_curr if r.get("_readiness_status") == "NOT READY")

    base = {
        "curr_rmssd": curr_rmssd,
        "prev_rmssd": prev_rmssd,
        "personal_sd": sd_median,
        "ready_count": ready_count,
        "partial_count": partial_count,
        "notready_count": notready_count,
    }

    # No previous month
    if prev_rmssd is None:
        return {
            **base,
            "status": "First Month",
            "method": "N/A",
            "drop_ms": None,
            "sd_fatigue_threshold": None,
            "sd_overreach_threshold": None,
            "change_pct": None,
        }

    # No current data
    if curr_rmssd is None:
        return {
            **base,
            "status": "Insufficient Data",
            "method": "N/A",
            "drop_ms": None,
            "sd_fatigue_threshold": None,
            "sd_overreach_threshold": None,
            "change_pct": None,
        }

    drop_ms = prev_rmssd - curr_rmssd  # positive = RMSSD fell

    # SD-adaptive path
    if len(sd_vals) >= _F1_SD_MIN_SESSIONS and sd_median is not None and sd_median > 0:
        fatigue_thresh = _F1_SD_FATIGUE_MULT * sd_median
        overreach_thresh = _F1_SD_OVERREACH_MULT * sd_median

        if drop_ms >= overreach_thresh:
            status = "Severe Overreaching"
        elif drop_ms >= fatigue_thresh:
            status = "Deploying Fatigue"
        else:
            status = "Stable"

        return {
            **base,
            "status": status,
            "method": "SD-adaptive",
            "drop_ms": round(drop_ms, 2),
            "sd_fatigue_threshold": round(fatigue_thresh, 2),
            "sd_overreach_threshold": round(overreach_thresh, 2),
            "change_pct": None,
        }

    # Fixed-% fallback
    pct_change = (curr_rmssd - prev_rmssd) / prev_rmssd * 100 if prev_rmssd != 0 else 0

    if pct_change >= _F1_PCT_STABLE_MIN:
        status = "Stable"
    elif pct_change >= _F1_PCT_FATIGUE_MIN:
        status = "Deploying Fatigue"
    else:
        status = "Severe Overreaching"

    return {
        **base,
        "status": status,
        "method": "fixed-% fallback",
        "drop_ms": round(drop_ms, 2),
        "sd_fatigue_threshold": None,
        "sd_overreach_threshold": None,
        "change_pct": round(pct_change, 1),
    }


# -- F2: Load Progression (month-over-month) -------------------------------

_LOAD_OPTIMAL_MIN = 5.0
_LOAD_OPTIMAL_MAX = 15.0
_LOAD_CAUTIOUS_MAX = 20.0


def _flag_load_progression(t_curr: List[Dict], t_prev: List[Dict]) -> Dict:
    """Compare mean session load (AU) between current and previous months."""
    curr_load_vals = [pf(t.get("training_load")) for t in t_curr if t.get("training_load") not in (None, "", 0)]
    curr_load_vals = [v for v in curr_load_vals if v > 0]
    curr_load = round(_safe_mean(curr_load_vals), 1) if curr_load_vals else None

    prev_load_vals = [pf(t.get("training_load")) for t in t_prev if t.get("training_load") not in (None, "", 0)]
    prev_load_vals = [v for v in prev_load_vals if v > 0]
    prev_load = round(_safe_mean(prev_load_vals), 1) if prev_load_vals else None

    # Score
    score_vals = [t["_score"] for t in t_curr if t.get("_score") is not None]
    curr_score = round(_safe_mean(score_vals), 1) if score_vals else None

    # Load tier counts
    load_low = sum(1 for t in t_curr if t.get("_training_load_flag") == "Low")
    load_moderate = sum(1 for t in t_curr if t.get("_training_load_flag") == "Moderate")
    load_high = sum(1 for t in t_curr if t.get("_training_load_flag") == "High")

    # ACWR status counts
    acwr_optimal = sum(1 for t in t_curr if t.get("_acwr_status") == "Optimal")
    acwr_low = sum(1 for t in t_curr if t.get("_acwr_status") == "Low")
    acwr_very_low = sum(1 for t in t_curr if t.get("_acwr_status") == "Very Low")
    acwr_danger = sum(1 for t in t_curr if t.get("_acwr_status") == "Danger")

    base = {
        "curr_load": curr_load,
        "prev_load": prev_load,
        "curr_score": curr_score,
        "load_low": load_low,
        "load_moderate": load_moderate,
        "load_high": load_high,
        "acwr_optimal": acwr_optimal,
        "acwr_low": acwr_low,
        "acwr_very_low": acwr_very_low,
        "acwr_danger": acwr_danger,
    }

    if prev_load is None or not t_prev:
        return {**base, "status": "First Month", "change_pct": None}

    if curr_load is None:
        return {**base, "status": "No Training Data", "change_pct": None}

    pct = (curr_load - prev_load) / prev_load * 100 if prev_load != 0 else 0

    if _LOAD_OPTIMAL_MIN <= pct <= _LOAD_OPTIMAL_MAX:
        status = "Optimal Progression"
    elif 0 <= pct < _LOAD_OPTIMAL_MIN or _LOAD_OPTIMAL_MAX < pct <= _LOAD_CAUTIOUS_MAX:
        status = "Cautious Ramp"
    elif pct > _LOAD_CAUTIOUS_MAX:
        status = "Dangerous Spike"
    else:
        status = "Detraining"

    return {**base, "status": status, "change_pct": round(pct, 1)}


# -- F3: Intensity Shape (exertion distribution) ---------------------------

_SHAPE_GREY_MOD_MIN = 40
_SHAPE_RECOVERY_LOW_MIN = 80
_SHAPE_RECOVERY_HIGH_MAX = 5
_SHAPE_HIGH_DOM_MIN = 40
_SHAPE_POL_LOW_MIN = 60
_SHAPE_POL_MOD_MAX = 20
_SHAPE_POL_HIGH_MIN = 15


def _flag_intensity_shape(t_curr: List[Dict]) -> Dict:
    """Classify the exertion distribution into a named shape."""
    n = len(t_curr)

    if n == 0:
        return {
            "shape": "No Training Data",
            "status": "No Training Data",
            "sport_note": "No training sessions recorded this month",
            "low_pct": None,
            "mod_pct": None,
            "high_pct": None,
            "session_count": 0,
        }

    low_n = sum(1 for t in t_curr if t.get("_exertion_level") == "1 - Low")
    mod_n = sum(1 for t in t_curr if t.get("_exertion_level") == "2 - Moderate")
    high_n = sum(1 for t in t_curr if t.get("_exertion_level") == "3 - High")

    low_pct = _safe_pct(low_n, n)
    mod_pct = _safe_pct(mod_n, n)
    high_pct = _safe_pct(high_n, n)

    if mod_pct >= _SHAPE_GREY_MOD_MIN:
        shape = "Grey Zone Dominant"
        note = "Bad for every athlete -- sprint: junk volume | endurance: over-intense"
    elif low_pct >= _SHAPE_RECOVERY_LOW_MIN and high_pct <= _SHAPE_RECOVERY_HIGH_MAX:
        shape = "Recovery Dominant"
        note = "Sprint: under-stimulating | Endurance: normal during taper/recovery week"
    elif high_pct >= _SHAPE_HIGH_DOM_MIN:
        shape = "High-Intensity Dominant"
        note = "Sprint: monitor CNS fatigue | Endurance: overreach risk"
    elif (low_pct >= _SHAPE_POL_LOW_MIN
          and mod_pct <= _SHAPE_POL_MOD_MAX
          and high_pct >= _SHAPE_POL_HIGH_MIN):
        shape = "Polarized"
        note = "Ideal for both sprint and endurance athletes"
    else:
        shape = "Aerobic Base"
        note = "Sprint: missing speed work | Endurance: acceptable in early base phase"

    return {
        "shape": shape,
        "status": shape,
        "sport_note": note,
        "low_pct": low_pct,
        "mod_pct": mod_pct,
        "high_pct": high_pct,
        "session_count": n,
    }


# -- F4: Training Balance (sprint/endurance mix) ---------------------------

def _flag_training_balance(t_curr: List[Dict]) -> Dict:
    """Descriptive modality tag — coach interprets against periodization plan."""
    total = len(t_curr)
    sprint_n = sum(1 for t in t_curr if t.get("_sub_type") == "Sprint")
    endurance_n = sum(1 for t in t_curr if t.get("_sub_type") == "Endurance")

    if total == 0:
        return {
            "tag": "No training sessions",
            "coach_note": "No training data recorded this month",
            "sprint_count": 0,
            "endurance_count": 0,
            "total_sessions": 0,
        }
    elif sprint_n > 0 and endurance_n > 0:
        tag = "Mixed block"
        note = (f"Sprint coach: check sprint-to-endurance ratio fits periodization. "
                f"Endurance coach: check volume balance.")
    elif sprint_n > 0:
        tag = "Pure sprint block"
        note = ("Sprint coach: normal if in speed/power phase. "
                "Endurance coach: unusual -- intended?")
    elif endurance_n > 0:
        tag = "Pure endurance block"
        note = ("Sprint coach: no neuromuscular stimulus -- planned base phase? "
                "Endurance coach: normal base block.")
    else:
        tag = "Unclassified"
        note = "Session sub-type could not be determined."

    return {
        "tag": tag,
        "coach_note": note,
        "sprint_count": sprint_n,
        "endurance_count": endurance_n,
        "total_sessions": total,
    }


# -- F5: Readiness Compliance (High exertion on NOT READY days) ------------

_COMPLIANCE_MINOR_MAX = 2

_STATUS_RANK = {"NOT READY": 4, "PARTIALLY READY": 3, "CALIBRATING": 2, "READY": 1}


def _flag_readiness_compliance(r_curr: List[Dict], t_curr: List[Dict]) -> Dict:
    """Count training sessions where High exertion was performed on NOT READY days."""
    # Build day -> worst readiness status map
    day_status: Dict[str, str] = {}
    for r in r_curr:
        d = r.get("date")
        status = r.get("_readiness_status")
        if d is None or not status:
            continue
        d_key = d.isoformat() if hasattr(d, "isoformat") else str(d)
        existing = day_status.get(d_key)
        if existing is None or _STATUS_RANK.get(status, 0) > _STATUS_RANK.get(existing, 0):
            day_status[d_key] = status

    if not day_status or not t_curr:
        return {
            "status": "No Data",
            "violation_count": 0,
            "violations": [],
        }

    # Join training sessions to that day's readiness
    violations = []
    for t in t_curr:
        d = t.get("date")
        if d is None:
            continue
        d_key = d.isoformat() if hasattr(d, "isoformat") else str(d)
        readiness_on_day = day_status.get(d_key)
        if (t.get("_exertion_level") == "3 - High"
                and readiness_on_day == "NOT READY"):
            violations.append({
                "date": d_key,
                "session": t.get("session", ""),
                "exertion": t.get("_exertion_level"),
                "readiness": readiness_on_day,
            })

    v_count = len(violations)
    if v_count == 0:
        status = "Excellent Discipline"
    elif v_count <= _COMPLIANCE_MINOR_MAX:
        status = "Minor Compliance Issues"
    else:
        status = "Poor Discipline"

    return {
        "status": status,
        "violation_count": v_count,
        "violations": violations,
    }


# -- Orchestrator: prepare_monthly_flags -----------------------------------

def prepare_monthly_flags(rows: List[Dict]) -> List[Dict]:
    """
    Compute all 5 monthly performance flags for each calendar month.
    Returns list of dicts (one per month, chronologically ordered).
    """
    if not rows:
        return []

    # Enrich all rows with per-session classifications
    _enrich_sessions(rows)

    # Group by calendar month
    months: Dict[str, Dict] = {}
    for r in rows:
        d = r.get("date")
        if d is None:
            continue
        key = fmt_month_key(d)
        label = fmt_month(d)
        if key not in months:
            months[key] = {"key": key, "label": label, "rows": []}
        months[key]["rows"].append(r)

    sorted_keys = sorted(months.keys())
    result = []

    for i, key in enumerate(sorted_keys):
        m = months[key]
        all_rows = m["rows"]

        r_curr = [r for r in all_rows if r.get("session_type") in ("Readiness", "Light Activity")]
        t_curr = [r for r in all_rows if r.get("session_type") == "Training"]

        if i > 0:
            prev_key = sorted_keys[i - 1]
            prev_rows = months[prev_key]["rows"]
            r_prev = [r for r in prev_rows if r.get("session_type") in ("Readiness", "Light Activity")]
            t_prev = [r for r in prev_rows if r.get("session_type") == "Training"]
        else:
            r_prev = []
            t_prev = []

        result.append({
            "month": m["label"],
            "rawMonth": key,
            "readinessCount": len(r_curr),
            "trainingCount": len(t_curr),
            "f1_readiness_trend": _flag_readiness_trend(r_curr, r_prev),
            "f2_load_progression": _flag_load_progression(t_curr, t_prev),
            "f3_intensity_shape": _flag_intensity_shape(t_curr),
            "f4_training_balance": _flag_training_balance(t_curr),
            "f5_compliance": _flag_readiness_compliance(r_curr, t_curr),
        })

    return result
