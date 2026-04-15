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


# -- Pairwise Comparison Engine (Athlete A vs Athlete B) -------------------

def _generate_readiness_feedback(row: Dict, name_a: str, name_b: str) -> str:
    rmssd_a, rmssd_b = row.get("rmssd_a"), row.get("rmssd_b")
    rest_a, rest_b = row.get("rest_hr_a"), row.get("rest_hr_b")
    avg_hr_a, avg_hr_b = row.get("avg_hr_a"), row.get("avg_hr_b")

    lines = []
    if rmssd_a is not None and rmssd_b is not None:
        leader = name_a if rmssd_a > rmssd_b else name_b
        diff = abs(rmssd_a - rmssd_b)
        lines.append(f"RMSSD gap {rmssd_a:.1f} vs {rmssd_b:.1f} (Δ {diff:.1f}) favors {leader} for readiness.")

    if rest_a is not None and rest_b is not None:
        lines.append(f"{name_a} rest HR {rest_a:.1f} vs {name_b} {rest_b:.1f} (lower is better).")

    if avg_hr_a is not None and avg_hr_b is not None:
        favors = name_a if avg_hr_a < avg_hr_b else name_b
        lines.append(f"Avg HR {avg_hr_a:.1f}/{avg_hr_b:.1f} shows better efficiency for {favors}.")

    return " | ".join(lines) if lines else "No overlapping readiness metrics on this date."


def _generate_training_feedback(row: Dict, name_a: str, name_b: str) -> str:
    acwr_a, acwr_b = row.get("acwr_a", 0), row.get("acwr_b", 0)
    epoc_a, epoc_b = row.get("epoc_a", 0), row.get("epoc_b", 0)

    lines = []
    gap_acwr = (acwr_a or 0) - (acwr_b or 0)
    if abs(gap_acwr) > 0.1:
        leader = name_a if gap_acwr > 0 else name_b
        lines.append(f"ACWR gap ({abs(gap_acwr):.2f}) indicates {leader} is pushing higher chronic load.")
    
    gap_epoc = (epoc_a or 0) - (epoc_b or 0)
    if abs(gap_epoc) > 50:
        leader = name_a if gap_epoc > 0 else name_b
        lines.append(f"EPOC difference ({abs(gap_epoc):.0f}) shows {leader} had higher physiological strain.")

    return " | ".join(lines) if lines else "Sessions are closely matched in intensity."


def compare_athletes_pairwise(rows_a: List[Dict], rows_b: List[Dict], name_a: str, name_b: str) -> Dict:
    """
    Merge sessions by date and produce pairwise readiness and training summaries.
    Matching the algo team's logic for feedback and gaps.
    """
    # Group by date for both
    def by_date(rows):
        d = defaultdict(list)
        for r in rows:
            dt = r.get("date")
            if dt:
                d[dt].append(r)
        return d

    data_a = by_date(rows_a)
    data_b = by_date(rows_b)
    all_dates = sorted(set(data_a.keys()) | set(data_b.keys()))

    readiness_comparisons = []
    training_comparisons = []

    for d in all_dates:
        def find_sess(rows, t_list):
            return next((r for r in rows if str(r.get("session_type", "")).strip().casefold() in [t.casefold() for t in t_list]), None)

        session_a = find_sess(data_a[d], ("Readiness", "Light Activity"))
        session_b = find_sess(data_b[d], ("Readiness", "Light Activity"))

        if session_a and session_b:
            rec = {
                "date": d.isoformat(),
                "rmssd_a": pf(session_a.get("rmssd")),
                "rmssd_b": pf(session_b.get("rmssd")),
                "rmssd_gap": pf((session_a.get("rmssd") or 0) - (session_b.get("rmssd") or 0)),
                "rest_hr_a": pf(session_a.get("rest_hr")),
                "rest_hr_b": pf(session_b.get("rest_hr")),
                "avg_hr_a": pf(session_a.get("avg_hr")),
                "avg_hr_b": pf(session_b.get("avg_hr")),
            }
            rec["feedback"] = _generate_readiness_feedback(rec, name_a, name_b)
            readiness_comparisons.append(rec)

        # Training merge
        train_a = find_sess(data_a[d], ("Training",))
        train_b = find_sess(data_b[d], ("Training",))

        if train_a and train_b:
            rec = {
                "date": d.isoformat(),
                "acwr_a": pf(train_a.get("acwr")),
                "acwr_b": pf(train_b.get("acwr")),
                "acwr_gap": pf((train_a.get("acwr") or 0) - (train_b.get("acwr") or 0)),
                "epoc_a": pf(train_a.get("epoc_total")),
                "epoc_b": pf(train_b.get("epoc_total")),
                "epoc_gap": pf((train_a.get("epoc_total") or 0) - (train_b.get("epoc_total") or 0)),
                "duration_a": pf(train_a.get("exercise_duration")),
                "duration_b": pf(train_b.get("exercise_duration")),
                "zones_a": {f"z{i}": pf(train_a.get(f"zone_{i}_pct")) for i in range(6)},
                "zones_b": {f"z{i}": pf(train_b.get(f"zone_{i}_pct")) for i in range(6)},
            }
            rec["feedback"] = _generate_training_feedback(rec, name_a, name_b)
            training_comparisons.append(rec)

    return {
        "readiness": readiness_comparisons[-30:],
        "training": training_comparisons[-30:],
    }


# -- Day Report (Athlete Snapshot for a specific date) ---------------------

def _session_metrics(row: Optional[Dict]) -> Optional[Dict]:
    """Extract all displayable metrics from a single session row."""
    if not row:
        return None
    d = row.get("date")
    return {
        "session_type": row.get("session_type"),
        "session_hour": row.get("session_hour"),
        "session_quality": pf(row.get("session_quality")),
        "date": d.isoformat() if d else None,
        # Heart rate
        "avg_hr": pf(row.get("avg_hr")),
        "min_hr": pf(row.get("min_hr")),
        "max_hr": pf(row.get("max_hr")),
        "rest_hr": pf(row.get("rest_hr")),
        "hr_std": pf(row.get("hr_std")),
        "max_hr_pct": pf(row.get("max_hr_pct")),
        "hr_recovery_60s": pf(row.get("hr_recovery_60s")),
        "recovery_beats": pf(row.get("recovery_beats")),
        # HRV
        "rmssd": pf(row.get("rmssd")),
        "sdnn": pf(row.get("sdnn")),
        "pnn50": pf(row.get("pnn50")),
        # Load
        "training_load": pf(row.get("training_load")),
        "training_intensity": pf(row.get("training_intensity")),
        "acute_load": pf(row.get("acute_load")),
        "chronic_load": pf(row.get("chronic_load")),
        "acwr": pf(row.get("acwr")),
        # Duration
        "exercise_duration": pf(row.get("exercise_duration")),
        # EPOC
        "epoc_total": pf(row.get("epoc_total")),
        "epoc_peak": pf(row.get("epoc_peak")),
        # Energy / VO2
        "ee_men": pf(row.get("ee_men")),
        "vo2": pf(row.get("vo2")),
        "vo2_max": pf(row.get("vo2_max")),
        # Movement
        "movement_load": pf(row.get("movement_load")),
        "movement_load_intensity": pf(row.get("movement_load_intensity")),
        # Training Effect
        "aerobic_te_value": pf(row.get("aerobic_te_value")),
        "aerobic_te_comment": row.get("aerobic_te_comment") or "",
        "anaerobic_te_value": pf(row.get("anaerobic_te_value")),
        "anaerobic_te_comment": row.get("anaerobic_te_comment") or "",
        # Zones (durations in minutes + percentages)
        "zones": {
            "z0": {"min": round(pf(row.get("zone_0_d")) / 60000, 1), "pct": pf(row.get("zone_0_pct"))},
            "z1": {"min": round(pf(row.get("zone_1_d")) / 60000, 1), "pct": pf(row.get("zone_1_pct"))},
            "z2": {"min": round(pf(row.get("zone_2_d")) / 60000, 1), "pct": pf(row.get("zone_2_pct"))},
            "z3": {"min": round(pf(row.get("zone_3_d")) / 60000, 1), "pct": pf(row.get("zone_3_pct"))},
            "z4": {"min": round(pf(row.get("zone_4_d")) / 60000, 1), "pct": pf(row.get("zone_4_pct"))},
            "z5": {"min": round(pf(row.get("zone_5_d")) / 60000, 1), "pct": pf(row.get("zone_5_pct"))},
        },
    }


def get_day_report(
    rows: List[Dict],
    target_date: Optional[date] = None,
    athlete_meta: Optional[Dict] = None,
) -> Dict:
    """
    Day-level snapshot for the report popup.

    Parameters
    ----------
    rows         : all sessions for the athlete (chronological)
    target_date  : the day to report on. Defaults to the latest session's date.
    athlete_meta : athlete metadata (name, age, sport, height, weight, gender)
    """
    from core.flags import (
        classify_readiness, classify_training_load, classify_exertion, compute_baselines
    )

    if not rows:
        return {}

    # Available dates (unique, sorted descending) — frontend date picker
    available_dates = sorted({r["date"] for r in rows if r.get("date")}, reverse=True)

    # Resolve target date
    if target_date is None:
        target_date = available_dates[0]

    selected_date_iso = target_date.isoformat()

    # Sessions for the selected day
    day_rows = [r for r in rows if r.get("date") == target_date]
    day_readiness = next((r for r in day_rows if r.get("session_type") in ("Readiness", "Light Activity")), None)
    day_training = next((r for r in day_rows if r.get("session_type") == "Training"), None)

    # Baselines anchored at target_date (uses all prior readiness sessions)
    readiness_rows = _readiness_rows(rows)
    bl = compute_baselines(readiness_rows, target_date)

    # --- Readiness ---
    readiness_score = 0
    readiness_status = "N/A"
    readiness_reasoning = "No readiness session recorded"

    if day_readiness:
        r_result = classify_readiness(day_readiness, bl)
        readiness_status = r_result["status"]

        rmssd = pf(day_readiness.get("rmssd"))
        rhr = pf(day_readiness.get("rest_hr"))
        bl_rmssd = bl.get("rmssd_mean_30") or rmssd
        bl_rhr = bl.get("rhr_mean_30") or rhr

        r_lines = []
        if rmssd > bl_rmssd:
            r_lines.append("HRV elevated")
        elif rmssd < bl_rmssd * 0.9:
            r_lines.append("HRV suppressed")
        else:
            r_lines.append("HRV stable")

        if rhr < bl_rhr:
            r_lines.append("Resting HR within baseline")
        else:
            r_lines.append("Resting HR slightly elevated")

        readiness_reasoning = " · ".join(r_lines)

        quality = pf(day_readiness.get("session_quality"), 70)
        hrv_pct = (rmssd / bl_rmssd * 100) if bl_rmssd else 100
        readiness_score = int((quality * 0.7) + (min(hrv_pct, 100) * 0.3))

    # --- Training flags ---
    load_flag = "N/A"
    exertion_level = "N/A"
    sub_type = None
    if day_training:
        tl_result = classify_training_load(day_training)
        ex_result = classify_exertion(day_training)
        load_flag = tl_result["flag"] or "N/A"
        raw_level = ex_result["level"]
        exertion_level = raw_level.split(" - ")[1] if " - " in raw_level else raw_level
        sub_type = ex_result.get("sub_type")

    # --- Metric summary (prefer readiness-sourced values for RHR/HRV) ---
    primary = day_readiness or day_training or day_rows[-1] if day_rows else None
    rhr_val = pf((day_readiness or primary or {}).get("rest_hr"))
    rmssd_val = pf((day_readiness or primary or {}).get("rmssd"))
    acwr_val = pf((day_training or primary or {}).get("acwr"))

    rhr_baseline = bl.get("rhr_mean_30") or rhr_val
    rmssd_week = bl.get("rmssd_mean_7") or rmssd_val
    rhr_diff = int(rhr_val - rhr_baseline) if rhr_baseline else 0
    rmssd_diff = int(rmssd_val - rmssd_week) if rmssd_week else 0

    # --- Last-session-of-the-day summary ---
    last_session_row = day_training or day_readiness
    duration = int((last_session_row or {}).get("exercise_duration") or 0)
    epoc = int((last_session_row or {}).get("epoc_total") or 0)

    # ACWR delta vs the previous session in chronological history
    current_idx = next(
        (i for i, r in enumerate(rows) if r is last_session_row),
        len(rows) - 1,
    )
    acwr_prev = pf(rows[current_idx - 1].get("acwr")) if current_idx > 0 else acwr_val
    acwr_delta = acwr_val - acwr_prev if acwr_val else 0

    # --- 7-day ACWR trend ending on target_date ---
    days_map = {0: "MO", 1: "TU", 2: "WE", 3: "TH", 4: "FR", 5: "SA", 6: "SU"}
    sorted_rows = sorted(rows, key=lambda x: x["date"])
    trend = []
    
    # We want the last known valid ACWR for each of the 7 days
    for i in range(6, -1, -1):
        d_target = target_date - timedelta(days=i)
        last_acwr = 0.0
        
        # Find the most recent session on or before d_target that HAS an acwr value
        for r in sorted_rows:
            if r["date"] <= d_target:
                val = r.get("acwr")
                if val is not None and val != "" and val != 0:
                    last_acwr = pf(val)
            else:
                break
                
        status = "Optimal"
        if last_acwr > 1.3:
            status = "Danger"
        elif last_acwr < 0.8:
            status = "Low"
            
        trend.append({
            "day": days_map[d_target.weekday()],
            "val": last_acwr,
            "status": status,
            "date": d_target.isoformat(),
        })

    # --- Athlete metadata ---
    athlete_card = None
    if athlete_meta:
        athlete_card = {
            "id": athlete_meta.get("id"),
            "name": athlete_meta.get("name"),
            "age": athlete_meta.get("age"),
            "sport": athlete_meta.get("sport"),
            "gender": athlete_meta.get("gender"),
            "height": athlete_meta.get("height"),
            "weight": athlete_meta.get("weight"),
        }

    # --- Sessions on the selected day (for sidebar list) ---
    day_sessions = [
        {
            "type": r.get("session_type"),
            "duration": int(r.get("exercise_duration") or 0),
            "hour": r.get("session_hour"),
        }
        for r in day_rows
    ]

    return {
        "selectedDate": selected_date_iso,
        "availableDates": [d.isoformat() for d in available_dates],
        "athlete": athlete_card,
        "daySessions": day_sessions,
        "readiness": {
            "score": readiness_score,
            "status": readiness_status,
            "reasoning": readiness_reasoning,
        },
        "training": {
            "load": load_flag,
            "exertion": exertion_level,
            "sub_type": sub_type,
        },
        "metrics": {
            "rhr": rhr_val,
            "rhr_diff": rhr_diff,
            "rhr_baseline": rhr_baseline,
            "rmssd": rmssd_val,
            "rmssd_diff": rmssd_diff,
            "rmssd_week": rmssd_week,
            "acwr": acwr_val,
        },
        "trend": trend,
        "zones": _session_metrics(day_training)["zones"] if day_training else None,
    }


# Backward-compat alias for any older import paths
get_latest_session_report = get_day_report
