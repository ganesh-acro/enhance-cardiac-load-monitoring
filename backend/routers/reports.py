"""
routers/reports.py
  GET /reports/summary  → table listing for Reports page
  GET /reports/{id}     → full session list for PDF generator
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.data import get_athletes, get_athlete_by_id, read_athlete_sessions, pf
from core.security.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"], dependencies=[Depends(get_current_user)])


@router.get("/summary")
def reports_summary(db: Session = Depends(get_db)):
    """Returns latest metrics per athlete for the reports table."""
    athletes = get_athletes(db)
    results = []

    for athlete in athletes:
        rows = read_athlete_sessions(db, athlete["id"])
        if not rows:
            continue
        latest = rows[-1]
        acwr = pf(latest.get("acwr"))

        if acwr > 1.3:
            flag = "Overtraining"
        elif acwr < 0.8:
            flag = "Undertraining"
        else:
            flag = "Optimal"

        results.append({
            "id": athlete["id"],
            "name": athlete["name"],
            "img": athlete.get("img") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={athlete['name']}",
            "sport": athlete.get("sport", "N/A"),
            "acwr": acwr,
            "avg_hr": pf(latest.get("avg_hr")),
            "rmssd": pf(latest.get("rmssd")),
            "flag": flag,
        })

    return results


@router.get("/{athlete_id}")
def report_detail(athlete_id: str, db: Session = Depends(get_db)):
    """
    Returns full session list for a single athlete.
    Used by PDF/report generator (ReportModal).
    """
    athlete = get_athlete_by_id(db, athlete_id)
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")

    rows = read_athlete_sessions(db, athlete["id"])

    # Return each session with all metrics for the report
    sessions = []
    for r in rows:
        sessions.append({
            "session": r.get("session"),
            "date": r["date"].isoformat(),
            "training_load": pf(r.get("training_load")),
            "training_intensity": pf(r.get("training_intensity")),
            "avg_hr": pf(r.get("avg_hr")),
            "min_hr": pf(r.get("min_hr")),
            "max_hr": pf(r.get("max_hr")),
            "rest_hr": pf(r.get("rest_hr")),
            "sdnn": pf(r.get("sdnn")),
            "rmssd": pf(r.get("rmssd")),
            "pnn50": pf(r.get("pnn50")),
            "epoc_total": pf(r.get("epoc_total")),
            "epoc_peak": pf(r.get("epoc_peak")),
            "ee_men": pf(r.get("ee_men")),
            "vo2": pf(r.get("vo2")),
            "vo2_max": pf(r.get("vo2_max")),
            "movement_load": pf(r.get("movement_load")),
            "movement_load_intensity": pf(r.get("movement_load_intensity")),
            "recovery_beats": pf(r.get("recovery_beats")),
            "acute_load": pf(r.get("acute_load")),
            "chronic_load": pf(r.get("chronic_load")),
            "acwr": pf(r.get("acwr")),
            "zone_0_pct": pf(r.get("zone_0_pct")),
            "zone_1_pct": pf(r.get("zone_1_pct")),
            "zone_2_pct": pf(r.get("zone_2_pct")),
            "zone_3_pct": pf(r.get("zone_3_pct")),
            "zone_4_pct": pf(r.get("zone_4_pct")),
            "zone_5_pct": pf(r.get("zone_5_pct")),
            "session_type": r.get("session_type", ""),
            "session_quality": pf(r.get("session_quality")),
        })

    return sessions
