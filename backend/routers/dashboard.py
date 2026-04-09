"""
routers/dashboard.py
Covers the full Performance Analytics (Dashboard) page:
  - GET /dashboard/overview       → team summary for AnalyticsOverview (no athlete selected)
  - GET /dashboard/{id}           → all individual athlete tabs (Overview, Training, Readiness)
  - GET /dashboard/{id}/comparison → Comparison tab secondary data
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from datetime import date
from typing import Optional, List
from sqlalchemy.orm import Session

from core.database import get_db
from core.data import (
    get_athletes, get_athlete_by_id,
    read_athlete_sessions, filter_by_date_range, pf
)
from core.compute import (
    build_charts, prepare_summary, get_athlete_summary,
    _readiness_rows, prepare_monthly_flags,
)
from core.flags import classify_readiness, compute_baselines
from core.security.dependencies import get_allowed_athlete_ids

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


# ---------------------------------------------------------------------------
# Team overview (AnalyticsOverview component — shown when no athlete selected)
# ---------------------------------------------------------------------------

@router.get("/overview")
def dashboard_overview(
    db: Session = Depends(get_db),
    allowed_ids: Optional[List[str]] = Depends(get_allowed_athlete_ids),
):
    """
    Returns latest metrics for all athletes AND pre-computed team aggregates.
    Used by AnalyticsOverview (HR analytics, readiness donut, zone intensity, resting HR bar).
    """
    athletes = get_athletes(db, allowed_ids)
    athletes_data = []
    for athlete in athletes:
        rows = read_athlete_sessions(db, athlete["id"])
        if not rows:
            continue
        latest = rows[-1]
        # Use rest_hr from the last readiness session specifically
        last_readiness = next(
            (r for r in reversed(rows)
             if r.get("session_type") in ("Readiness", "Light Activity")),
            latest,
        )

        # Compute readiness status from latest readiness session
        readiness = _readiness_rows(rows)
        readiness_status = None
        if readiness:
            latest_r = readiness[-1]
            bl = compute_baselines(readiness, latest_r["date"])
            readiness_status = classify_readiness(latest_r, bl)["status"]

        # Use latest Training session for zone data
        last_training = next(
            (r for r in reversed(rows) if r.get("session_type") == "Training"),
            None,
        )
        zone_source = last_training or {}

        athletes_data.append({
            "id": athlete["id"],
            "name": athlete["name"],
            "img": athlete.get("img") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={athlete['name']}",
            "acwr": pf(latest.get("acwr")),
            "avg_hr": pf(latest.get("avg_hr")),
            "rest_hr": pf(last_readiness.get("rest_hr")),
            "rmssd": pf(latest.get("rmssd")),
            "training_load": pf(latest.get("training_load")),
            "readiness_status": readiness_status,
            "zones": {
                "z0": pf(zone_source.get("zone_0_pct")),
                "z1": pf(zone_source.get("zone_1_pct")),
                "z2": pf(zone_source.get("zone_2_pct")),
                "z3": pf(zone_source.get("zone_3_pct")),
                "z4": pf(zone_source.get("zone_4_pct")),
                "z5": pf(zone_source.get("zone_5_pct")),
            },
        })

    n = len(athletes_data) or 1

    # Pre-compute team aggregates based on readiness classification
    ready        = [a for a in athletes_data if a["readiness_status"] == "READY"]
    partial      = [a for a in athletes_data if a["readiness_status"] == "PARTIALLY READY"]
    not_ready    = [a for a in athletes_data if a["readiness_status"] == "NOT READY"]

    avg_team_hr  = round(sum(a["avg_hr"]  for a in athletes_data) / n, 1)
    avg_rest_hr  = round(sum(a["rest_hr"] for a in athletes_data) / n, 1)

    rmssd_vals = [a["rmssd"] for a in athletes_data if a["rmssd"] > 0]
    avg_rmssd = round(sum(rmssd_vals) / len(rmssd_vals), 1) if rmssd_vals else 0

    load_vals = [a["training_load"] for a in athletes_data if a["training_load"] > 0]
    avg_training_load = round(sum(load_vals) / len(load_vals), 1) if load_vals else 0

    zone_avgs = {
        f"z{z}": round(sum(a["zones"][f"z{z}"] for a in athletes_data) / n, 1)
        for z in range(6)
    }

    return {
        "athletes": athletes_data,
        "teamStats": {
            "totalAthletes": len(athletes_data),
            "readyAthletes": len(ready),
            "partiallyReady": len(partial),
            "notReady": len(not_ready),
            "avgTeamHR": avg_team_hr,
            "avgRestHR": avg_rest_hr,
            "avgRmssd": avg_rmssd,
            "avgTrainingLoad": avg_training_load,
            "zoneAverages": zone_avgs,
        }
    }


# ---------------------------------------------------------------------------
# Individual athlete dashboard — all tabs
# ---------------------------------------------------------------------------

@router.get("/{athlete_id}")
def athlete_dashboard(
    athlete_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    allowed_ids: Optional[List[str]] = Depends(get_allowed_athlete_ids),
):
    """
    Returns full chart data + summary for a single athlete.
    Feeds Overview, Training, and Readiness tabs.
    """
    athlete = get_athlete_by_id(db, athlete_id, allowed_ids)
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")

    rows = read_athlete_sessions(db, athlete["id"])
    rows = filter_by_date_range(rows, start_date, end_date)

    summary = prepare_summary(rows)
    athlete_summary = get_athlete_summary(rows, athlete)
    charts = build_charts(rows)
    monthly_flags = prepare_monthly_flags(rows)

    return {
        "athlete": {
            "id": athlete["id"],
            "name": athlete["name"],
            "age": athlete.get("age", "N/A"),
            "height": athlete.get("height", "N/A"),
            "weight": athlete.get("weight", "N/A"),
            "sport": athlete.get("sport", "N/A"),
            "gender": athlete.get("gender", "M"),
            "img": athlete.get("img") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={athlete['name']}",
        },
        "summary": summary,
        "athleteSummary": athlete_summary,
        "charts": charts,
        "monthlyFlags": monthly_flags,
    }


# ---------------------------------------------------------------------------
# Comparison tab — secondary athlete or period data
# ---------------------------------------------------------------------------

@router.get("/{athlete_id}/comparison")
def athlete_comparison(
    athlete_id: str,
    target_id: Optional[str] = Query(None),       # compare with another athlete
    start_date: Optional[date] = Query(None),      # primary date range
    end_date: Optional[date] = Query(None),
    secondary_start: Optional[date] = Query(None), # secondary period range
    secondary_end: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    allowed_ids: Optional[List[str]] = Depends(get_allowed_athlete_ids),
):
    """
    Returns chart data for the comparison side.
    - If target_id is provided: returns data for that athlete (filtered by start_date/end_date).
    - If no target_id but secondary_start/end: returns data for same athlete in that period.
    """
    if target_id:
        # Athlete comparison
        secondary = get_athlete_by_id(db, target_id, allowed_ids)
        if not secondary:
            raise HTTPException(status_code=404, detail="Target athlete not found")
        rows = read_athlete_sessions(db, secondary["id"])
        rows = filter_by_date_range(rows, start_date, end_date)
        return {
            "athlete": {"id": secondary["id"], "name": secondary["name"]},
            "athleteSummary": get_athlete_summary(rows, secondary),
            "charts": build_charts(rows),
        }
    elif secondary_start and secondary_end:
        # Period comparison — same athlete, different time slice
        athlete = get_athlete_by_id(db, athlete_id, allowed_ids)
        if not athlete:
            raise HTTPException(status_code=404, detail="Athlete not found")
        rows = read_athlete_sessions(db, athlete["id"])
        rows = filter_by_date_range(rows, secondary_start, secondary_end)
        return {
            "athlete": {"id": athlete["id"], "name": f"{athlete['name']} (period 2)"},
            "athleteSummary": get_athlete_summary(rows, athlete),
            "charts": build_charts(rows),
        }
    else:
        raise HTTPException(status_code=400, detail="Provide target_id or secondary_start/end")
