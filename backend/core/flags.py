"""
core/flags.py — Classification flags for Readiness, Training Load, and Exertion.

Ported from Flag_Score_v2.py. Pure Python (no pandas/numpy).
Operates on session row dicts as returned by data.read_athlete_sessions().

FLAG 1 — READINESS (Readiness sessions only)
  READY / PARTIALLY READY / NOT READY / CALIBRATING
  SWC (Smallest Worthwhile Change = 0.5 x SD) on 30-day rolling personal
  baseline. Individualized thresholds replace population averages.
  Quality gate, 7-day SWC-adaptive trend, RHR modifiers.

  References:
    Hopkins (2004) Sportscience — SWC as 0.5 x SD
    Flatt & Esco (2016) IJSPP — individualized HRV monitoring

FLAG 2 — EXERTION (Training sessions only)
  1 - Low / 2 - Moderate / 3 - High
  Auto-detects Sprint vs Endurance from physiology.
  Sprint: anaerobic_te >= 3.0 AND zone4+5 < 300s
  Endurance: zone-based 6-step hierarchical model.

  References:
    Gabbett (2016) BJSM · Seiler (2010) · Borsheim & Bahr (2003)
    Firstbeat Sports (2023) — anaerobic TE scale

FLAG 3 — TRAINING LOAD (Training sessions only)
  Low / Moderate / High  (AU tiers)
  ACWR status: Optimal / Elevated / Danger / Low / Very Low

  References:
    Lucia (2003) · Foster (2001) · Seiler & Kjerland (2006)
"""
from __future__ import annotations

import math
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

EXERTION_LEVELS = ["1 - Low", "2 - Moderate", "3 - High"]
EX_LOW = "1 - Low"
EX_MODERATE = "2 - Moderate"
EX_HIGH = "3 - High"

R_READY = "READY"
R_PARTIALLY = "PARTIALLY READY"
R_NOT_READY = "NOT READY"
R_CALIBRATING = "CALIBRATING"

SPRINT_ANAEROBIC_TE_MIN = 3.0
SPRINT_ZONE45_MAX_SEC = 300


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
        if math.isnan(f):
            return None
        return f
    except (ValueError, TypeError):
        return None


def _mean(values: List[float]) -> Optional[float]:
    """Mean of a list of floats, or None if empty."""
    if not values:
        return None
    return sum(values) / len(values)


def _std(values: List[float]) -> Optional[float]:
    """Sample standard deviation (ddof=1). Requires >= 2 values."""
    if len(values) < 2:
        return None
    m = _mean(values)
    variance = sum((x - m) ** 2 for x in values) / (len(values) - 1)
    return math.sqrt(variance)


def _bump(level: str, n: int = 1) -> str:
    """Upgrade exertion level by n steps, capped at High."""
    idx = EXERTION_LEVELS.index(level)
    return EXERTION_LEVELS[min(idx + n, 2)]


def _drop(level: str, n: int = 1) -> str:
    """Downgrade exertion level by n steps, floored at Low."""
    idx = EXERTION_LEVELS.index(level)
    return EXERTION_LEVELS[max(idx - n, 0)]


# ---------------------------------------------------------------------------
# Baselines (30-day + 7-day rolling)
# ---------------------------------------------------------------------------

def compute_baselines(
    readiness_rows: List[Dict],
    target_date: date,
) -> Dict:
    """
    Compute 30-day and 7-day rolling baselines from readiness sessions
    PRIOR to (not including) target_date.

    Returns dict with:
        count_30, rmssd_mean_30, rmssd_sd_30,
        rhr_mean_30, rmssd_mean_7, rhr_mean_7
    """
    day_30 = target_date - timedelta(days=30)
    day_7 = target_date - timedelta(days=7)

    rmssd_30: List[float] = []
    rhr_30: List[float] = []
    rmssd_7: List[float] = []
    rhr_7: List[float] = []
    count_30 = 0

    for r in readiness_rows:
        d = r.get("date")
        if d is None:
            continue

        # 30-day window
        if day_30 <= d < target_date:
            count_30 += 1
            rmssd = _val(r, "rmssd")
            if rmssd is not None:
                rmssd_30.append(rmssd)
            rhr = _val(r, "rest_hr")
            if rhr is not None:
                rhr_30.append(rhr)

        # 7-day window
        if day_7 <= d < target_date:
            rmssd = _val(r, "rmssd")
            if rmssd is not None:
                rmssd_7.append(rmssd)
            rhr = _val(r, "rest_hr")
            if rhr is not None:
                rhr_7.append(rhr)

    return {
        "count_30": count_30,
        "rmssd_mean_30": round(_mean(rmssd_30), 2) if rmssd_30 else None,
        "rmssd_sd_30": round(_std(rmssd_30), 2) if len(rmssd_30) >= 2 else None,
        "rhr_mean_30": round(_mean(rhr_30), 2) if rhr_30 else None,
        "rmssd_mean_7": round(_mean(rmssd_7), 2) if rmssd_7 else None,
        "rhr_mean_7": round(_mean(rhr_7), 2) if rhr_7 else None,
    }


def compute_7day_baselines(
    readiness_rows: List[Dict],
    target_date: date,
) -> Tuple[Optional[float], Optional[float]]:
    """Backward-compatible wrapper. Returns (rmssd_7d_avg, rhr_7d_avg)."""
    bl = compute_baselines(readiness_rows, target_date)
    return bl["rmssd_mean_7"], bl["rhr_mean_7"]


# ---------------------------------------------------------------------------
# READINESS CLASSIFICATION — SWC-based (v2)
# ---------------------------------------------------------------------------

def classify_readiness(row: Dict, baselines: Dict) -> Dict:
    """
    6-step hybrid readiness classifier using SWC (Smallest Worthwhile Change).

    S1  Quality gate        — < 0.60 -> NOT READY (stop)
    S2  SWC classification  — personalized thresholds from 30-day baseline
          CALIBRATING       : < 7 prior sessions (population fallback)
          READY             : rmssd >= mean - 0.5 * SD
          PARTIALLY READY   : rmssd >= mean - 1.0 * SD
          NOT READY         : rmssd < mean - 1.0 * SD
    S3  7-day RMSSD trend   — SWC-adaptive or 10% fallback
    S4  Resting HR          — absolute range + 7-day trend modifiers
    S5  ACWR context        — note only, never changes status

    Parameters
    ----------
    row       : session row dict
    baselines : dict from compute_baselines()

    Returns
    -------
    {"status": str, "rmssd_sd_30": float | None}
    """
    rmssd = _val(row, "rmssd")
    quality = _val(row, "session_quality")
    rest_hr = _val(row, "rest_hr")

    # Normalize quality from 0-100 to 0-1
    quality_norm = quality / 100.0 if quality is not None else None

    count_30 = baselines.get("count_30", 0)
    rmssd_mean_30 = baselines.get("rmssd_mean_30")
    rmssd_sd_30 = baselines.get("rmssd_sd_30")
    rmssd_mean_7 = baselines.get("rmssd_mean_7")
    rhr_mean_7 = baselines.get("rhr_mean_7")

    # -- S1: Quality Gate --------------------------------------------------
    if quality_norm is not None and quality_norm < 0.60:
        return {"status": R_NOT_READY, "rmssd_sd_30": rmssd_sd_30}

    # -- S2: SWC Classification --------------------------------------------
    if count_30 < 7:
        # Calibrating — use population thresholds
        if rmssd is not None:
            if rmssd > 50:
                status = R_READY
            elif rmssd >= 20:
                status = R_PARTIALLY
            else:
                status = R_NOT_READY
        else:
            status = R_PARTIALLY
    else:
        # Personal baseline available
        if (rmssd is not None and rmssd_mean_30 is not None
                and rmssd_sd_30 is not None):
            swc = 0.5 * rmssd_sd_30
            lower_ready = rmssd_mean_30 - swc
            lower_pr = rmssd_mean_30 - rmssd_sd_30

            if rmssd >= lower_ready:
                status = R_READY
            elif rmssd >= lower_pr:
                status = R_PARTIALLY
            else:
                status = R_NOT_READY

        elif rmssd is not None and rmssd_mean_30 is not None:
            # Mean available but SD not yet stable
            status = R_PARTIALLY

        elif rmssd is not None:
            # No prior RMSSD data to personalize
            if rmssd > 50:
                status = R_READY
            elif rmssd >= 20:
                status = R_PARTIALLY
            else:
                status = R_NOT_READY
        else:
            status = R_PARTIALLY

    # -- Population sanity floor ------------------------------------------
    # If strict personal SWC flags NOT READY but RMSSD is still inside the
    # population "partial" range (>= 20 ms), soften to PARTIALLY READY.
    # Rationale: a significant personal drop is worth flagging, but an
    # absolute RMSSD that would still be considered healthy/partial across
    # the population shouldn't be classified as fully NOT READY.
    if status == R_NOT_READY and rmssd is not None and rmssd >= 20:
        status = R_PARTIALLY

    # -- S3: 7-Day RMSSD Trend (SWC-adaptive) -----------------------------
    if rmssd is not None and rmssd_mean_7 is not None:
        drop = rmssd_mean_7 - rmssd  # positive = today below 7-day avg
        if rmssd_sd_30 is not None:
            # Adaptive path: SWC from 30-day baseline
            swc_trend = 0.5 * rmssd_sd_30
            if drop >= swc_trend and status == R_READY:
                status = R_PARTIALLY
        else:
            # Blind-window fallback: 10% conservative threshold
            pct = (rmssd - rmssd_mean_7) / rmssd_mean_7 if rmssd_mean_7 > 0 else 0
            if pct <= -0.10 and status == R_READY:
                status = R_PARTIALLY

    # -- S4: Resting HR ----------------------------------------------------
    if rest_hr is not None:
        if rest_hr > 100 and status == R_READY:
            status = R_PARTIALLY
        elif rest_hr > 90 and status == R_READY:
            status = R_PARTIALLY
        elif rest_hr > 75 and status == R_READY:
            status = R_PARTIALLY

    # RHR 7-day trend
    if rest_hr is not None and rhr_mean_7 is not None:
        if (rest_hr - rhr_mean_7) > 5 and status == R_READY:
            status = R_PARTIALLY

    # S5: ACWR context — informational only, never changes status

    return {"status": status, "rmssd_sd_30": rmssd_sd_30}


# ---------------------------------------------------------------------------
# SPRINT DETECTION
# ---------------------------------------------------------------------------

def _detect_sprint(row: Dict) -> bool:
    """
    Returns True when the session physiology matches a sprint pattern.
    Criterion: anaerobic TE >= 3.0 AND sustained Zone 4+5 time < 300s.
    """
    ate = _val(row, "anaerobic_te_value")
    z4 = (_val(row, "zone_4_d") or 0) / 1000
    z5 = (_val(row, "zone_5_d") or 0) / 1000
    return (
        ate is not None
        and ate >= SPRINT_ANAEROBIC_TE_MIN
        and (z4 + z5) < SPRINT_ZONE45_MAX_SEC
    )


# ---------------------------------------------------------------------------
# EXERTION — Endurance (zone-based 6-step)
# ---------------------------------------------------------------------------

def _classify_endurance(row: Dict) -> Dict:
    """Zone-based 3-tier exertion classifier for endurance sessions."""
    acwr = _val(row, "acwr")
    t_int = _val(row, "training_intensity")

    z0 = (_val(row, "zone_0_d") or 0) / 1000
    z1 = (_val(row, "zone_1_d") or 0) / 1000
    z2 = (_val(row, "zone_2_d") or 0) / 1000
    z3 = (_val(row, "zone_3_d") or 0) / 1000
    z4 = (_val(row, "zone_4_d") or 0) / 1000
    z5 = (_val(row, "zone_5_d") or 0) / 1000

    zone45_sec = z4 + z5
    total_sec = z0 + z1 + z2 + z3 + z4 + z5
    fat_burn = (z0 + z1 + z2) / total_sec if total_sec > 0 else None

    # S1: ACWR base
    if acwr is not None:
        if acwr < 0.80:
            level = EX_LOW
        elif acwr > 1.30:
            level = EX_HIGH
        else:
            level = EX_MODERATE
    else:
        level = EX_MODERATE

    # S2: Zone 4+5 gate
    if zone45_sec == 0:
        level = EX_LOW
    else:
        # S3: Zone 4+5 upgrade (> 600s)
        if zone45_sec > 600:
            level = _bump(level)

    # S4: Modifiers — intensity + fat burn
    if t_int is not None and t_int > 0.80:
        level = _bump(level)

    if fat_burn is not None:
        if fat_burn >= 0.85:
            level = _drop(level)
        elif fat_burn < 0.50:
            level = _bump(level)

    # S5: EPOC cross-check
    epoc_total = _val(row, "epoc_total")
    epoc_peak = _val(row, "epoc_peak")

    if epoc_total is not None:
        if epoc_total < 100 and level == EX_HIGH:
            level = _drop(level)
        elif epoc_total > 600 and level in (EX_LOW, EX_MODERATE):
            level = _bump(level)
        elif epoc_total < 300 and level == EX_HIGH:
            level = EX_MODERATE
        elif epoc_peak is not None and epoc_peak > 7.0 and level in (EX_LOW, EX_MODERATE):
            level = _bump(level)

    # S6: Max HR % cross-check
    max_hr_pct = _val(row, "max_hr_pct")

    if max_hr_pct is not None:
        epoc_confirmed = epoc_total is not None and epoc_total >= 50
        if max_hr_pct > 90 and epoc_confirmed and level in (EX_LOW, EX_MODERATE):
            level = _bump(level)
        elif max_hr_pct < 65 and level == EX_HIGH:
            level = _drop(level)

    return {"level": level, "sub_type": "Endurance"}


# ---------------------------------------------------------------------------
# EXERTION — Sprint (anaerobic TE-based 5-step)
# ---------------------------------------------------------------------------

def _classify_sprint(row: Dict) -> Dict:
    """Anaerobic TE-based 3-tier exertion classifier for sprint sessions."""
    acwr = _val(row, "acwr")
    ate = _val(row, "anaerobic_te_value")
    mli = _val(row, "movement_load_intensity")
    epoc_total = _val(row, "epoc_total")
    epoc_peak = _val(row, "epoc_peak")

    # S1: ACWR base
    if acwr is not None:
        if acwr < 0.80:
            level = EX_LOW
        elif acwr > 1.30:
            level = EX_HIGH
        else:
            level = EX_MODERATE
    else:
        level = EX_MODERATE

    # S2: Anaerobic TE gate (PRIMARY)
    if ate is not None:
        if ate >= 4.0:
            if EXERTION_LEVELS.index(level) < EXERTION_LEVELS.index(EX_HIGH):
                level = EX_HIGH
        elif ate >= 3.0:
            if EXERTION_LEVELS.index(level) < EXERTION_LEVELS.index(EX_MODERATE):
                level = EX_MODERATE
        elif ate < 2.5:
            if EXERTION_LEVELS.index(level) > EXERTION_LEVELS.index(EX_LOW):
                level = EX_LOW

    # S3: Movement Load Intensity
    if mli is not None and mli > 250:
        level = _bump(level)

    # S4: EPOC cross-check
    if epoc_total is not None:
        if epoc_total < 50 and level == EX_HIGH:
            level = _drop(level)
        elif epoc_peak is not None and epoc_peak > 7.0 and level in (EX_LOW, EX_MODERATE):
            level = _bump(level)

    # S5: Anaerobic TE hard floor — ensures TE signal is never overridden
    if ate is not None:
        if ate >= 4.0 and EXERTION_LEVELS.index(level) < EXERTION_LEVELS.index(EX_HIGH):
            level = EX_HIGH
        elif ate >= 3.0 and EXERTION_LEVELS.index(level) < EXERTION_LEVELS.index(EX_MODERATE):
            level = EX_MODERATE

    return {"level": level, "sub_type": "Sprint"}


# ---------------------------------------------------------------------------
# EXERTION — Entry point (routes to sprint or endurance)
# ---------------------------------------------------------------------------

def classify_exertion(row: Dict) -> Dict:
    """
    Classify a training session's exertion. Auto-detects Sprint vs Endurance.

    Returns {"level": "1 - Low"|"2 - Moderate"|"3 - High", "sub_type": "Sprint"|"Endurance"}
    """
    if _detect_sprint(row):
        return _classify_sprint(row)
    return _classify_endurance(row)


# ---------------------------------------------------------------------------
# TRAINING LOAD CLASSIFICATION — 3-tier + ACWR status
# ---------------------------------------------------------------------------

def classify_training_load(row: Dict) -> Dict:
    """
    Classify a training session's load into 3 tiers with ACWR status.

    Thresholds (Lucia 2003 / Foster 2001 / Seiler 2006):
      Low      : < 84 AU
      Moderate : 84-128 AU
      High     : > 128 AU

    ACWR status (Gabbett 2016):
      Optimal  : 0.80-1.30
      Elevated : 1.30-1.50
      Danger   : > 1.50
      Low      : 0.50-0.80
      Very Low : < 0.50
    """
    load = _val(row, "training_load")
    acwr = _val(row, "acwr")

    # Load tier
    if load is None:
        flag = None
    elif load < 84:
        flag = "Low"
    elif load <= 128:
        flag = "Moderate"
    else:
        flag = "High"

    # ACWR status
    if acwr is not None:
        if 0.80 <= acwr <= 1.30:
            acwr_status = "Optimal"
        elif 1.30 < acwr <= 1.50:
            acwr_status = "Elevated"
        elif acwr > 1.50:
            acwr_status = "Danger"
        elif 0.50 <= acwr < 0.80:
            acwr_status = "Low"
        else:
            acwr_status = "Very Low"
    else:
        acwr_status = "No ACWR"

    return {"flag": flag, "acwr_status": acwr_status}


# ---------------------------------------------------------------------------
# SESSION SCORE — combines Training Load + Exertion
# ---------------------------------------------------------------------------

_TL_MAP = {"Low": 1, "Moderate": 2, "High": 3}
_EX_MAP = {EX_LOW: 1, EX_MODERATE: 2, EX_HIGH: 3}


def compute_score(tl_flag: Optional[str], ex_level: Optional[str]) -> Optional[int]:
    """
    Combined session score: (TL_numeric - 1) * 3 + EX_numeric.
    Range 1-9. Returns None if either input is missing.
    """
    tl = _TL_MAP.get(tl_flag)
    ex = _EX_MAP.get(ex_level)
    if tl is None or ex is None:
        return None
    return (tl - 1) * 3 + ex
