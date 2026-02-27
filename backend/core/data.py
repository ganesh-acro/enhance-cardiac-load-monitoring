"""
core/data.py — Data access layer (PostgreSQL).
Replaces CSV-based reads with database queries.
Return contracts are preserved so compute.py needs zero changes.
"""
from datetime import date
from typing import List, Dict, Optional

from sqlalchemy.orm import Session as DbSession
from core.models import Athlete, Session


# ---------------------------------------------------------------------------
# Float helper (imported by compute.py and routers — do not remove)
# ---------------------------------------------------------------------------

def pf(val, default: float = 0.0) -> float:
    """Safe float parse."""
    try:
        return float(val) if val not in (None, "", "nan") else default
    except (ValueError, TypeError):
        return default


# ---------------------------------------------------------------------------
# Session ORM → dict conversion
# ---------------------------------------------------------------------------

# Columns that map directly from Session model to row dict
_SESSION_FIELDS = [
    "avg_hr", "min_hr", "max_hr", "rest_hr",
    "avg_hr_pct", "min_hr_pct", "max_hr_pct",
    "training_load", "training_intensity",
    "sdnn", "rmssd", "pnn50",
    "epoc_total", "epoc_peak",
    "ee_men", "vo2", "vo2_max",
    "movement_load", "movement_load_intensity",
    "session_type", "session_hour", "session_quality", "recovery_beats",
    "zone_0_d", "zone_0_pct", "zone_1_d", "zone_1_pct",
    "zone_2_d", "zone_2_pct", "zone_3_d", "zone_3_pct",
    "zone_4_d", "zone_4_pct", "zone_5_d", "zone_5_pct",
    "acute_load", "chronic_load", "acwr",
]


def _session_to_dict(s: Session) -> Dict:
    """Convert a Session ORM object to the dict format compute.py expects."""
    row = {field: getattr(s, field) for field in _SESSION_FIELDS}
    row["session"] = s.session_code
    row["date"] = s.session_date
    row["session_hour_parsed"] = s.session_hour
    return row


# ---------------------------------------------------------------------------
# Athlete queries
# ---------------------------------------------------------------------------

def get_athletes(db: DbSession) -> List[Dict]:
    """Return all athletes as list of dicts."""
    athletes = db.query(Athlete).order_by(Athlete.id).all()
    return [
        {
            "id": a.id,
            "name": a.name,
            "age": a.age,
            "height": a.height,
            "weight": a.weight,
            "sport": a.sport,
            "gender": a.gender,
            "img": a.img,
        }
        for a in athletes
    ]


def get_athlete_by_id(db: DbSession, athlete_id: str) -> Optional[Dict]:
    """Find one athlete by id. Returns dict or None."""
    a = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not a:
        return None
    return {
        "id": a.id,
        "name": a.name,
        "age": a.age,
        "height": a.height,
        "weight": a.weight,
        "sport": a.sport,
        "gender": a.gender,
        "img": a.img,
    }


# ---------------------------------------------------------------------------
# Session queries
# ---------------------------------------------------------------------------

def read_athlete_sessions(db: DbSession, athlete_id: str) -> List[Dict]:
    """
    Query all sessions for an athlete, ordered by date.
    Returns List[Dict] with same keys compute.py expects:
      - "date" (datetime.date)
      - "session_hour_parsed" (int)
      - "session" (str — the session code)
      - All metric column names
    """
    sessions = (
        db.query(Session)
        .filter(Session.athlete_id == athlete_id)
        .order_by(Session.session_date, Session.session_timestamp)
        .all()
    )
    return [_session_to_dict(s) for s in sessions]


# ---------------------------------------------------------------------------
# Filtering
# ---------------------------------------------------------------------------

def filter_by_date_range(rows: List[Dict],
                         start: Optional[date],
                         end: Optional[date]) -> List[Dict]:
    """Filter rows to [start, end] inclusive. Returns all rows if either is None."""
    if not start or not end:
        return rows
    return [r for r in rows if start <= r["date"] <= end]
