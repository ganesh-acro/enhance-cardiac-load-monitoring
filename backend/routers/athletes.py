"""
routers/athletes.py — GET /athletes
Returns the athlete registry.
"""
from fastapi import APIRouter
from core.data import get_athletes

router = APIRouter(prefix="/athletes", tags=["athletes"])


@router.get("")
def list_athletes():
    """Return all athletes from athletes.csv."""
    return get_athletes()
