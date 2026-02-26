"""
routers/profiles.py — GET /profiles/summary
Serves the Profiles listing page.
"""
from fastapi import APIRouter
from core.data import get_athletes, read_athlete_csv, pf

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/summary")
def profiles_summary():
    """
    Returns latest snapshot per athlete for the Profiles page.
    Includes ACWR-based flag for colour-coding.
    """
    athletes = get_athletes()
    results = []

    for athlete in athletes:
        rows = read_athlete_csv(athlete["file"])
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

        try:
            session_date = latest["date"].strftime("%b %d, %Y")
        except Exception:
            session_date = "N/A"

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
            "flag": flag,
        })

    return results
