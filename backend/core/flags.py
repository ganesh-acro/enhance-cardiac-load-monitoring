"""
core/flags.py — Classification flags for Readiness, Training Load, and Exertion.

Ported from Raise_flags.py. Pure Python (no pandas/numpy).
Operates on session row dicts as returned by data.read_athlete_sessions().

FLAG 1 — READINESS (Readiness sessions only)
  READY / PARTIALLY READY / NOT READY
  Based on RMSSD, session quality, resting HR, 7-day trends.

FLAG 2 — EXERTION (Training sessions only)
  Minimal / Low / Moderate / High / Peak
  6-step hierarchical: ACWR → Zone 4+5 gate → modifiers → EPOC → Max HR%.

FLAG 3 — TRAINING LOAD (Training sessions only)
  Low / Moderate / High / Very High
  Based on training_load (AU) thresholds.
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _val(row: Dict, key: str) -> Optional[float]:
    """Extract a numeric value from a row dict. Returns None if missing/invalid."""
    v = row.get(key)
    if v is None:
        return None
    try:
        f = float(v)
        return f
    except (ValueError, TypeError):
        return None


def _mean(values: List[float]) -> Optional[float]:
    """Mean of a list of floats, or None if empty."""
    if not values:
        return None
    return sum(values) / len(values)


# ---------------------------------------------------------------------------
# 7-Day Rolling Baselines (for Readiness)
# ---------------------------------------------------------------------------

def compute_7day_baselines(
    readiness_rows: List[Dict],
    target_date: date,
) -> Tuple[Optional[float], Optional[float]]:
    """
    Compute mean RMSSD and mean Resting HR from readiness sessions
    in the 7 days PRIOR to (not including) target_date.

    Returns (rmssd_7d_avg, rhr_7d_avg). Either may be None.
    """
    week_start = target_date - timedelta(days=7)

    rmssd_vals: List[float] = []
    rhr_vals: List[float] = []

    for r in readiness_rows:
        d = r.get("date")
        if d is None:
            continue
        if week_start <= d < target_date:
            rmssd = _val(r, "rmssd")
            if rmssd is not None:
                rmssd_vals.append(rmssd)
            rhr = _val(r, "rest_hr")
            if rhr is not None:
                rhr_vals.append(rhr)

    return (_mean(rmssd_vals), _mean(rhr_vals))


# ---------------------------------------------------------------------------
# READINESS CLASSIFICATION — 3-tier (READY / PARTIALLY READY / NOT READY)
# ---------------------------------------------------------------------------

def classify_readiness(
    row: Dict,
    rmssd_7d_avg: Optional[float],
    rhr_7d_avg: Optional[float],
) -> Dict:
    """
    Classify a readiness session into READY / PARTIALLY READY / NOT READY.

    Thresholds from:
      - Lifelines Cohort (n=84,772) · Welltory (n=296,000+)
      - AHA resting HR guidelines
      - Kubios normative RMSSD ranges
    """
    rmssd = _val(row, "rmssd")
    quality = _val(row, "session_quality")
    rest_hr = _val(row, "rest_hr")
    acwr = _val(row, "acwr")

    # Normalize quality from 0-100 to 0-1
    quality_norm = quality / 100.0 if quality is not None else None

    # ── STEP 1: Quality Gate ─────────────────────────────────────────────
    quality_red = quality_norm is not None and quality_norm < 0.60
    quality_yellow = quality_norm is not None and 0.60 <= quality_norm < 0.80

    if quality_red:
        return {"status": "NOT READY"}

    # ── STEP 2: RMSSD Primary Gate ───────────────────────────────────────
    if rmssd is not None:
        if rmssd > 50:
            status = "READY"
        elif rmssd >= 20:
            status = "PARTIALLY READY"
        else:
            status = "NOT READY"
    else:
        status = "PARTIALLY READY"

    # ── STEP 3: Veto Rule (quality + instability) ────────────────────────
    if status == "READY" and quality_red:
        status = "PARTIALLY READY"

    # ── STEP 4: 7-Day RMSSD Trend ────────────────────────────────────────
    if rmssd is not None and rmssd_7d_avg is not None and rmssd_7d_avg > 0:
        pct = (rmssd - rmssd_7d_avg) / rmssd_7d_avg
        if pct <= -0.20:
            if status == "READY":
                status = "PARTIALLY READY"

    # ── STEP 5: Resting HR ───────────────────────────────────────────────
    if rest_hr is not None:
        if rest_hr > 100:
            if status == "READY":
                status = "PARTIALLY READY"
        elif rest_hr > 90:
            if status == "READY":
                status = "PARTIALLY READY"
        elif rest_hr > 75:
            if status == "READY":
                status = "PARTIALLY READY"

    # Resting HR — 7-day trend (flag if > 5 bpm above baseline)
    if rest_hr is not None and rhr_7d_avg is not None:
        rhr_diff = rest_hr - rhr_7d_avg
        if rhr_diff > 5:
            if status == "READY":
                status = "PARTIALLY READY"

    # STEP 6: ACWR context — informational only, does not change status

    return {"status": status}


# ---------------------------------------------------------------------------
# EXERTION CLASSIFICATION — 5-level hierarchical
# ---------------------------------------------------------------------------

_EXERTION_LEVELS = ["Minimal", "Low", "Moderate", "High", "Peak"]


def _bump(level: str, n: int = 1) -> str:
    idx = _EXERTION_LEVELS.index(level)
    return _EXERTION_LEVELS[min(idx + n, 4)]


def _drop(level: str, n: int = 1) -> str:
    idx = _EXERTION_LEVELS.index(level)
    return _EXERTION_LEVELS[max(idx - n, 0)]


def classify_exertion(row: Dict) -> Dict:
    """
    Classify a training session's exertion using a 6-step hierarchical model.

    Steps: ACWR base → Zone 4+5 gate → intensity/fat-burn modifiers →
           EPOC cross-check → Max HR% cross-check.
    """
    acwr = _val(row, "acwr")
    t_int = _val(row, "training_intensity")

    z0 = (_val(row, "zone_0_d") or 0) / 1000  # ms → seconds
    z1 = (_val(row, "zone_1_d") or 0) / 1000
    z2 = (_val(row, "zone_2_d") or 0) / 1000
    z3 = (_val(row, "zone_3_d") or 0) / 1000
    z4 = (_val(row, "zone_4_d") or 0) / 1000
    z5 = (_val(row, "zone_5_d") or 0) / 1000

    zone45_sec = z4 + z5
    total_sec = z0 + z1 + z2 + z3 + z4 + z5
    fat_burn = (z0 + z1 + z2) / total_sec if total_sec > 0 else None

    # STEP 1: Base via ACWR
    if acwr is not None:
        if acwr < 0.5:
            level = "Minimal"
        elif acwr >= 1.0:
            level = "High"
        else:
            level = "Moderate"
    else:
        level = "Moderate"

    # STEP 2: Zone 4+5 Gate
    if zone45_sec == 0:
        level = "Low"
    else:
        # STEP 3: Zone 4+5 upgrade
        if zone45_sec > 600:
            level = _bump(level)

    # STEP 4: Modifiers
    if t_int is not None and t_int > 0.80:
        level = _bump(level)

    if fat_burn is not None:
        if fat_burn >= 0.85:
            level = _drop(level)
        elif fat_burn < 0.50:
            level = _bump(level)

    # STEP 5: EPOC Cross-Check
    epoc_total = _val(row, "epoc_total")
    epoc_peak = _val(row, "epoc_peak")

    if epoc_total is not None:
        if epoc_total < 100 and level in ("High", "Peak"):
            level = _drop(level)
        elif epoc_total > 600 and level in ("Moderate", "High"):
            level = _bump(level)
        elif epoc_total < 300 and level == "Peak":
            level = "High"
        elif epoc_peak is not None and epoc_peak > 7.0 and level in ("Moderate", "High"):
            level = _bump(level)

    # STEP 6: Max HR % Cross-Check
    max_hr_pct = _val(row, "max_hr_pct")

    if max_hr_pct is not None:
        epoc_confirmed = epoc_total is not None and epoc_total >= 50
        if max_hr_pct > 90 and epoc_confirmed and level in ("Moderate", "High"):
            level = _bump(level)
        elif max_hr_pct < 65 and level in ("High", "Peak"):
            level = _drop(level)

    return {"level": level}


# ---------------------------------------------------------------------------
# TRAINING LOAD CLASSIFICATION — 4-tier
# ---------------------------------------------------------------------------

def classify_training_load(row: Dict) -> Dict:
    """
    Classify a training session's load into 4 tiers.

    Thresholds from:
      - Lucia (2003) VT zones
      - Foster (2001) RPE
      - Seiler (2006) polarised model
      - Data-driven percentile split (p33≈84, p67≈128, p90≈201)
    """
    load = _val(row, "training_load")

    if load is None:
        return {"flag": None}

    if load < 80:
        flag = "Low"
    elif load < 130:
        flag = "Moderate"
    elif load < 200:
        flag = "High"
    else:
        flag = "Very High"

    return {"flag": flag}
