from datetime import date, datetime
from sqlalchemy import (
    Column, String, Integer, Float, BigInteger, Date, DateTime,
    ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from core.database import Base


class Athlete(Base):
    __tablename__ = "athletes"

    id = Column(String, primary_key=True)                   # "AEH-001"
    name = Column(String, nullable=False)
    age = Column(Integer)
    height = Column(Float)
    weight = Column(Float)
    sport = Column(String)
    gender = Column(String)
    img = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sessions = relationship("Session", back_populates="athlete")

    __table_args__ = (
        Index("idx_athletes_name", "name"),
    )


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    athlete_id = Column(String, ForeignKey("athletes.id"), nullable=False)
    session_code = Column(String, nullable=False)           # "20250307_002647"
    session_date = Column(Date, nullable=False)
    session_timestamp = Column(DateTime, nullable=False)

    # Heart rate
    avg_hr = Column(Float)
    min_hr = Column(Float)
    max_hr = Column(Float)
    rest_hr = Column(Float)
    avg_hr_pct = Column(Float)
    min_hr_pct = Column(Float)
    max_hr_pct = Column(Float)

    # Load & intensity
    training_load = Column(Float)
    training_intensity = Column(Float)

    # HRV
    sdnn = Column(Float)
    rmssd = Column(Float)
    pnn50 = Column(Float)

    # EPOC
    epoc_total = Column(Float)
    epoc_peak = Column(Float)

    # Energy & VO2
    ee_men = Column(Float)
    vo2 = Column(Float)
    vo2_max = Column(Float)

    # Movement
    movement_load = Column(Float)
    movement_load_intensity = Column(Float)

    # Session metadata
    session_type = Column(String)
    session_hour = Column(Integer)
    session_quality = Column(Float)
    recovery_beats = Column(Float)

    # Zone durations (milliseconds)
    zone_0_d = Column(BigInteger)
    zone_0_pct = Column(Float)
    zone_1_d = Column(BigInteger)
    zone_1_pct = Column(Float)
    zone_2_d = Column(BigInteger)
    zone_2_pct = Column(Float)
    zone_3_d = Column(BigInteger)
    zone_3_pct = Column(Float)
    zone_4_d = Column(BigInteger)
    zone_4_pct = Column(Float)
    zone_5_d = Column(BigInteger)
    zone_5_pct = Column(Float)

    # Pre-computed load metrics
    acute_load = Column(Float)
    chronic_load = Column(Float)
    acwr = Column(Float)

    athlete = relationship("Athlete", back_populates="sessions")

    __table_args__ = (
        UniqueConstraint("athlete_id", "session_code", name="uq_athlete_session"),
        Index("idx_sessions_athlete", "athlete_id"),
        Index("idx_sessions_date", "session_date"),
        Index("idx_sessions_athlete_date", "athlete_id", session_date.desc()),
        Index("idx_sessions_acwr", "acwr"),
    )
