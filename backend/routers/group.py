"""
routers/group.py — GET /group/summary
Serves the GroupDashboard page with all athletes' latest metrics,
split by session type (Training vs Readiness).
"""
from datetime import date as DateType
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.data import get_athletes, read_athlete_sessions, pf
from core.security.dependencies import get_allowed_athlete_ids

router = APIRouter(prefix="/group", tags=["group"])

TRAINING_METRIC_KEYS = [
    "training_load", "training_intensity", "acwr",
    "vo2", "ee_men", "epoc_total",
]

READINESS_METRIC_KEYS = [
    "avg_hr", "rmssd", "recovery_beats", "rest_hr",
]


def _latest_by_type(rows, session_type_check):
    """Return the latest row matching a session-type predicate, or None."""
    matched = [r for r in rows if session_type_check(r)]
    return matched[-1] if matched else None


def _build_athlete_entry(athlete, latest, metric_keys):
    """Build a single athlete dict from their latest session of a given type."""
    if not latest:
        return None
    try:
        last_date = latest["date"].strftime("%d %b %Y")
        session_date = latest["date"].strftime("%b %d, %Y")
    except Exception:
        last_date = session_date = "N/A"

    entry = {
        "id": athlete["id"],
        "name": athlete["name"],
        "img": athlete.get("img") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={athlete['name']}",
        "sport": athlete.get("sport", "N/A"),
        "sessionDate": session_date,
        "lastDate": last_date,
    }
    for key in metric_keys:
        entry[key] = pf(latest.get(key))
    return entry


def _group_averages(results, metric_keys):
    """Pre-compute group averages for a list of athlete entries."""
    n = len(results) or 1
    return {
        key: round(sum(a[key] for a in results) / n, 1)
        for key in metric_keys
    }


@router.get("/summary")
def group_summary(
    db: Session = Depends(get_db),
    allowed_ids: Optional[List[str]] = Depends(get_allowed_athlete_ids),
    date_from: Optional[DateType] = Query(None),
    date_to: Optional[DateType] = Query(None),
):
    """
    Returns latest Training and Readiness session metrics per athlete,
    within the given date range, with pre-computed group averages.
    """
    athletes = get_athletes(db, allowed_ids)
    training_results = []
    readiness_results = []

    for athlete in athletes:
        rows = read_athlete_sessions(db, athlete["id"])
        if not rows:
            continue

        # Filter by date range if provided
        if date_from or date_to:
            filtered = []
            for r in rows:
                d = r.get("date")
                if d is None:
                    continue
                row_date = d.date() if hasattr(d, "date") else d
                if date_from and row_date < date_from:
                    continue
                if date_to and row_date > date_to:
                    continue
                filtered.append(r)
            rows = filtered

        if not rows:
            continue

        # Latest Training session
        latest_training = _latest_by_type(
            rows, lambda r: r.get("session_type") == "Training"
        )
        t_entry = _build_athlete_entry(athlete, latest_training, TRAINING_METRIC_KEYS)
        if t_entry:
            # ACWR is a rolling metric — use the most recent value across all session types
            latest_any = rows[-1]
            t_entry["acwr"] = pf(latest_any.get("acwr"))
            training_results.append(t_entry)

        # Latest Readiness session
        latest_readiness = _latest_by_type(
            rows, lambda r: r.get("session_type") in ("Readiness", "Light Activity")
        )
        r_entry = _build_athlete_entry(athlete, latest_readiness, READINESS_METRIC_KEYS)
        if r_entry:
            readiness_results.append(r_entry)

    return {
        "training": {
            "athletes": training_results,
            "groupAverages": _group_averages(training_results, TRAINING_METRIC_KEYS),
        },
        "readiness": {
            "athletes": readiness_results,
            "groupAverages": _group_averages(readiness_results, READINESS_METRIC_KEYS),
        },
    }
