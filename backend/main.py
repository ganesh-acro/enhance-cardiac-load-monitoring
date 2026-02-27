"""
backend/main.py — FastAPI app entry point.
All routes are modular via routers.
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import athletes, dashboard, group, profiles, reports
from core.database import engine, Base
from core.models import Athlete, Session  # noqa: F401 — registers models on Base

app = FastAPI(title="Enhance Cardiac Monitoring API", version="2.0")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# CORS — allow everything for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
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
