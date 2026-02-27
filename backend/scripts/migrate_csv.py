"""
Migrate CSV data into PostgreSQL.

Usage:
    cd backend
    python -m scripts.migrate_csv

Reads athletes.csv and each athlete's session CSV,
validates and inserts into the athletes and sessions tables.
Safe to re-run — duplicates are skipped via ON CONFLICT.
"""

import csv
import os
import sys
from datetime import datetime

# Ensure backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from core.database import SessionLocal, engine, Base
from core.models import Athlete, Session

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")


def pf(val, default=0.0):
    """Safe float parse."""
    try:
        return float(val) if val not in (None, "", "nan") else default
    except (ValueError, TypeError):
        return default


def pi(val, default=0):
    """Safe int parse."""
    try:
        return int(float(val)) if val not in (None, "", "nan") else default
    except (ValueError, TypeError):
        return default


def parse_age(age_str: str) -> int | None:
    """Parse '22Y' → 22."""
    if not age_str:
        return None
    return int(age_str.replace("Y", "").replace("y", "").strip())


def parse_session_timestamp(session_code: str) -> datetime | None:
    """Parse '20250307_002647' → datetime."""
    try:
        return datetime.strptime(session_code, "%Y%m%d_%H%M%S")
    except (ValueError, TypeError):
        return None


def migrate_athletes(db) -> dict:
    """Insert athletes from CSV. Returns {athlete_id: filename} mapping."""
    path = os.path.join(DATA_DIR, "athletes.csv")
    if not os.path.exists(path):
        print(f"ERROR: {path} not found")
        return {}

    mapping = {}
    inserted = 0
    skipped = 0

    with open(path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            athlete_id = row["id"].strip()
            mapping[athlete_id] = row.get("file", "").strip()

            exists = db.query(Athlete).filter(Athlete.id == athlete_id).first()
            if exists:
                skipped += 1
                continue

            athlete = Athlete(
                id=athlete_id,
                name=row.get("name", "").strip(),
                age=parse_age(row.get("age", "")),
                height=pf(row.get("height"), default=None),
                weight=pf(row.get("weight"), default=None),
                sport=row.get("sport", "").strip() or None,
                gender=None,  # Not in current CSV
                img=row.get("img", "").strip() or None,
            )
            db.add(athlete)
            inserted += 1

    db.commit()
    print(f"Athletes: {inserted} inserted, {skipped} skipped (already exist)")
    return mapping


def migrate_sessions(db, athlete_id: str, filename: str) -> tuple[int, int, int]:
    """Insert sessions for one athlete. Returns (inserted, skipped, errored)."""
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        print(f"  WARNING: {path} not found for {athlete_id}")
        return 0, 0, 0

    inserted = 0
    skipped = 0
    errored = 0
    seen_codes = set()

    with open(path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            session_code = row.get("session", "").strip()
            if not session_code:
                errored += 1
                continue

            ts = parse_session_timestamp(session_code)
            if ts is None:
                errored += 1
                continue

            # Skip duplicates within same CSV
            if session_code in seen_codes:
                skipped += 1
                continue
            seen_codes.add(session_code)

            # Check duplicate in DB
            exists = db.query(Session.id).filter(
                Session.athlete_id == athlete_id,
                Session.session_code == session_code,
            ).first()
            if exists:
                skipped += 1
                continue

            session = Session(
                athlete_id=athlete_id,
                session_code=session_code,
                session_date=ts.date(),
                session_timestamp=ts,
                avg_hr=pf(row.get("avg_hr")),
                min_hr=pf(row.get("min_hr")),
                max_hr=pf(row.get("max_hr")),
                rest_hr=pf(row.get("rest_hr")),
                avg_hr_pct=pf(row.get("avg_hr_pct")),
                min_hr_pct=pf(row.get("min_hr_pct")),
                max_hr_pct=pf(row.get("max_hr_pct")),
                training_load=pf(row.get("training_load")),
                training_intensity=pf(row.get("training_intensity")),
                sdnn=pf(row.get("sdnn")),
                rmssd=pf(row.get("rmssd")),
                pnn50=pf(row.get("pnn50")),
                epoc_total=pf(row.get("epoc_total")),
                epoc_peak=pf(row.get("epoc_peak")),
                ee_men=pf(row.get("ee_men")),
                vo2=pf(row.get("vo2")),
                vo2_max=pf(row.get("vo2_max")),
                movement_load=pf(row.get("movement_load")),
                movement_load_intensity=pf(row.get("movement_load_intensity")),
                session_type=row.get("session_type", "").strip() or None,
                session_hour=pi(row.get("session_hour")),
                session_quality=pf(row.get("session_quality")),
                recovery_beats=pf(row.get("recovery_beats")),
                zone_0_d=pi(row.get("zone_0_d")),
                zone_0_pct=pf(row.get("zone_0_pct")),
                zone_1_d=pi(row.get("zone_1_d")),
                zone_1_pct=pf(row.get("zone_1_pct")),
                zone_2_d=pi(row.get("zone_2_d")),
                zone_2_pct=pf(row.get("zone_2_pct")),
                zone_3_d=pi(row.get("zone_3_d")),
                zone_3_pct=pf(row.get("zone_3_pct")),
                zone_4_d=pi(row.get("zone_4_d")),
                zone_4_pct=pf(row.get("zone_4_pct")),
                zone_5_d=pi(row.get("zone_5_d")),
                zone_5_pct=pf(row.get("zone_5_pct")),
                acute_load=pf(row.get("acute_load")),
                chronic_load=pf(row.get("chronic_load")),
                acwr=pf(row.get("acwr")),
            )
            db.add(session)
            inserted += 1

    db.commit()
    return inserted, skipped, errored


def main():
    print("=" * 60)
    print("Enhance — CSV to PostgreSQL Migration")
    print("=" * 60)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Step 1: Athletes
        print("\n--- Migrating Athletes ---")
        mapping = migrate_athletes(db)

        # Step 2: Sessions per athlete
        print("\n--- Migrating Sessions ---")
        total_inserted = 0
        total_skipped = 0
        total_errored = 0

        for athlete_id, filename in mapping.items():
            if not filename:
                print(f"  {athlete_id}: no CSV filename, skipping")
                continue

            ins, skip, err = migrate_sessions(db, athlete_id, filename)
            total_inserted += ins
            total_skipped += skip
            total_errored += err
            print(f"  {athlete_id} ({filename}): {ins} inserted, {skip} skipped, {err} errors")

        print(f"\nSessions total: {total_inserted} inserted, {total_skipped} skipped, {total_errored} errors")

        # Summary
        athlete_count = db.query(Athlete).count()
        session_count = db.query(Session).count()
        print(f"\n--- Database Summary ---")
        print(f"Athletes in DB: {athlete_count}")
        print(f"Sessions in DB: {session_count}")
        print("=" * 60)
        print("Migration complete.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
