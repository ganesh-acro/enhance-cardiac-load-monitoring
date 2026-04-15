"""
routers/profiles.py — GET /profiles/summary
Serves the Profiles listing page.
"""
from typing import Optional, List
from datetime import date as date_type
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.data import get_athletes, get_athlete_by_id, read_athlete_sessions, pf
from core.compute import _training_rows, _readiness_rows
from core.flags import classify_readiness, classify_training_load, classify_exertion, compute_baselines
from core.security.dependencies import get_allowed_athlete_ids

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/summary")
def profiles_summary(
    db: Session = Depends(get_db),
    allowed_ids: Optional[List[str]] = Depends(get_allowed_athlete_ids),
):
    """
    Returns latest snapshot per athlete for the Profiles page.
    Includes ACWR-based flag for colour-coding.
    """
    athletes = get_athletes(db, allowed_ids)
    results = []

    for athlete in athletes:
        rows = read_athlete_sessions(db, athlete["id"])
        if not rows:
            continue

        latest = rows[-1]
        acwr = pf(latest.get("acwr"))

        # Split by session type
        training = _training_rows(rows)
        readiness = _readiness_rows(rows)

        # Readiness classification (latest readiness session)
        readiness_status = None
        if readiness:
            latest_readiness = readiness[-1]
            bl = compute_baselines(readiness, latest_readiness["date"])
            readiness_result = classify_readiness(latest_readiness, bl)
            readiness_status = readiness_result["status"]

        # Training Load + Exertion (latest training session)
        training_load_flag = None
        exertion_level = None
        if training:
            latest_training = training[-1]
            tl_result = classify_training_load(latest_training)
            training_load_flag = tl_result["flag"]
            ex_result = classify_exertion(latest_training)
            raw_level = ex_result["level"]
            exertion_level = raw_level.split(" - ")[1] if " - " in raw_level else raw_level

        try:
            session_date = latest["date"].strftime("%b %d, %Y")
        except Exception:
            session_date = "N/A"

        # Last 5 sessions for mini chart (date, avg_hr, session_type)
        recent_sessions = []
        for row in rows[-5:]:
            try:
                d = row["date"].strftime("%b %d")
            except Exception:
                d = "N/A"
            recent_sessions.append({
                "date": d,
                "avg_hr": pf(row.get("avg_hr")),
                "session_type": row.get("session_type", "Training"),
            })

        # Raw training intensity for progress bar
        training_intensity = None
        if training:
            training_intensity = pf(training[-1].get("training_intensity"))

        results.append({
            "id": athlete["id"],
            "name": athlete["name"],
            "img": athlete.get("img") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={athlete['name']}",
            "sport": athlete.get("sport", "N/A"),
            "sessionDate": session_date,
            "acwr": acwr,
            "avg_hr": pf(latest.get("avg_hr")),
            "rest_hr": pf(latest.get("rest_hr")),
            "rmssd": pf(latest.get("rmssd")),
            "training_load": pf(latest.get("training_load")),
            "readiness_status": readiness_status,
            "training_load_flag": training_load_flag,
            "exertion_level": exertion_level,
            "training_intensity": training_intensity,
            "recent_sessions": recent_sessions,
        })

    return results


@router.get("/{athlete_id}/report")
def athlete_session_report(
    athlete_id: str,
    date: Optional[date_type] = Query(None, description="Target day (YYYY-MM-DD). Defaults to the athlete's latest session date."),
    db: Session = Depends(get_db),
    allowed_ids: Optional[List[str]] = Depends(get_allowed_athlete_ids),
):
    """Returns the deep snapshot for the day-report popup."""
    from core.compute import get_day_report

    # 1. Access check
    if allowed_ids is not None and athlete_id not in allowed_ids:
        return {"error": "Access denied"}

    # 2. Fetch rows + athlete metadata
    rows = read_athlete_sessions(db, athlete_id)
    if not rows:
        return {}
    athlete_meta = get_athlete_by_id(db, athlete_id, allowed_ids) or {}

    # 3. Compute report for the requested day
    return get_day_report(rows, target_date=date, athlete_meta=athlete_meta)
