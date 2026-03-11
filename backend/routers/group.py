"""
routers/group.py — GET /group/summary
Serves the GroupDashboard page with all athletes' latest metrics.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.data import get_athletes, read_athlete_sessions, pf
from core.security.dependencies import get_current_user

router = APIRouter(prefix="/group", tags=["group"], dependencies=[Depends(get_current_user)])


@router.get("/summary")
def group_summary(db: Session = Depends(get_db)):
    """
    Returns latest session metrics for all athletes AND pre-computed group averages.
    Fields match METRICS_CONFIG keys in GroupDashboard.jsx.
    """
    athletes = get_athletes(db)
    results = []

    metric_keys = ["avg_hr", "training_load", "training_intensity", "acwr", "epoc_total", "rmssd"]

    for athlete in athletes:
        rows = read_athlete_sessions(db, athlete["id"])
        if not rows:
            continue
        latest = rows[-1]
        try:
            last_date = latest["date"].strftime("%d %b %Y")
            session_date = latest["date"].strftime("%b %d, %Y")
        except Exception:
            last_date = session_date = "N/A"

        results.append({
            "id": athlete["id"],
            "name": athlete["name"],
            "img": athlete.get("img") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={athlete['name']}",
            "sport": athlete.get("sport", "N/A"),
            "sessionDate": session_date,
            "lastDate": last_date,
            "avg_hr": pf(latest.get("avg_hr")),
            "training_load": pf(latest.get("training_load")),
            "training_intensity": pf(latest.get("training_intensity")),
            "acwr": pf(latest.get("acwr")),
            "epoc_total": pf(latest.get("epoc_total")),
            "rmssd": pf(latest.get("rmssd")),
            "rest_hr": pf(latest.get("rest_hr")),
            "acute_load": pf(latest.get("acute_load")),
            "zones": {
                "z0": pf(latest.get("zone_0_pct")),
                "z1": pf(latest.get("zone_1_pct")),
                "z2": pf(latest.get("zone_2_pct")),
                "z3": pf(latest.get("zone_3_pct")),
                "z4": pf(latest.get("zone_4_pct")),
                "z5": pf(latest.get("zone_5_pct")),
            },
        })

    # Pre-compute group averages so GroupDashboard.jsx does zero math
    n = len(results) or 1
    group_averages = {
        key: round(sum(a[key] for a in results) / n, 1)
        for key in metric_keys
    }

    return {
        "athletes": results,
        "groupAverages": group_averages,
    }
