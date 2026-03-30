"""
backend/main.py — FastAPI app entry point.
All routes are modular via routers.
"""
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from routers import athletes, dashboard, group, profiles, reports
from api import auth
from core.database import engine, Base
from core.models import Athlete, Session, User, LoginHistory  # noqa: F401 — registers models on Base
from core.limiter import limiter

app = FastAPI(title="Enhance Cardiac Monitoring API", version="2.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# ── CORS — restricted to allowed origins ─────────────────────────────────────
_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
_allowed_origins = [o.strip() for o in _origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(athletes.router)
app.include_router(dashboard.router)
app.include_router(group.router)
app.include_router(profiles.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
