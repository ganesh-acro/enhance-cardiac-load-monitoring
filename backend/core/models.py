from datetime import date, datetime
from sqlalchemy import (
    Column, String, Integer, Float, BigInteger, Date, DateTime,
    ForeignKey, UniqueConstraint, Index, Boolean, Table
)
from sqlalchemy.orm import relationship
from core.database import Base


# Junction table: which coaches manage which athletes
coach_athletes = Table(
    "coach_athletes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("athlete_id", String, ForeignKey("athletes.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="coach")   # admin | coach | athlete
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    assigned_athletes = relationship("Athlete", secondary=coach_athletes, lazy="selectin")

    __table_args__ = (
        Index("idx_users_email", "email"),
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String(128), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

    __table_args__ = (
        Index("idx_refresh_tokens_token", "token"),
        Index("idx_refresh_tokens_user", "user_id"),
    )


class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ip_address = Column(String, nullable=False, default="unknown")
    user_agent = Column(String, nullable=False, default="unknown")
    logged_in_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

    __table_args__ = (
        Index("idx_login_history_user", "user_id"),
    )


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
    hr_std = Column(Float)
    avg_hr_pct = Column(Float)
    min_hr_pct = Column(Float)
    max_hr_pct = Column(Float)
    hr_recovery_60s = Column(Float)

    # Exercise & Load
    exercise_duration = Column(Float)
    training_load = Column(Float)
    training_intensity = Column(Float)

    # HRV
    sdnn = Column(Float)
    rmssd = Column(Float)
    pnn50 = Column(Float)

    # EPOC
    epoc_total = Column(Float)
    epoc_peak = Column(Float)

    # Training Effect
    aerobic_te_value = Column(Float)
    aerobic_te_comment = Column(String)
    anaerobic_te_value = Column(Float)
    anaerobic_te_comment = Column(String)

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
