"""
core/data.py — low-level CSV helpers and date utilities.
Replaces csvParser.js: parseSessionDate, parseCSV, filterByDateRange.
"""
import csv
import os
from datetime import date, datetime
from typing import List, Dict, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


# ---------------------------------------------------------------------------
# Date helpers
# ---------------------------------------------------------------------------

def parse_session_date(session: str) -> Optional[date]:
    """Parse YYYYMMDD_HHMMSS → datetime.date. Returns None on failure."""
    if not session:
        return None
    try:
        date_str = session.split("_")[0]          # "20250307"
        return datetime.strptime(date_str, "%Y%m%d").date()
    except Exception:
        return None


def get_session_hour(session: str) -> Optional[int]:
    """Parse YYYYMMDD_HHMMSS → hour (int)."""
    if not session:
        return None
    try:
        time_part = session.split("_")[1]          # "002647"
        return int(time_part[:2])
    except Exception:
        return None


# ---------------------------------------------------------------------------
# CSV readers
# ---------------------------------------------------------------------------

def get_athletes() -> List[Dict]:
    """Read athletes.csv → list of dicts."""
    path = os.path.join(DATA_DIR, "athletes.csv")
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def get_athlete_by_id(athlete_id: str) -> Optional[Dict]:
    """Find one athlete by id."""
    return next((a for a in get_athletes() if a["id"] == athlete_id), None)


def read_athlete_csv(filename: str) -> List[Dict]:
    """
    Read an athlete's session CSV.
    Adds 'date' (datetime.date) and 'session_hour_parsed' (int) to each row.
    Rows without a parseable date are dropped.
    """
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    rows = []
    with open(path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            d = parse_session_date(row.get("session", ""))
            if d is None:
                continue
            row["date"] = d
            row["session_hour_parsed"] = get_session_hour(row.get("session", ""))
            rows.append(row)
    return rows


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


# ---------------------------------------------------------------------------
# Float helper
# ---------------------------------------------------------------------------

def pf(val, default: float = 0.0) -> float:
    """Safe float parse."""
    try:
        return float(val) if val not in (None, "", "nan") else default
    except (ValueError, TypeError):
        return default
