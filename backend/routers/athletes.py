"""
routers/athletes.py — GET /athletes
Returns the athlete registry.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.data import get_athletes
from core.security.dependencies import get_current_user

router = APIRouter(prefix="/athletes", tags=["athletes"], dependencies=[Depends(get_current_user)])


@router.get("")
def list_athletes(db: Session = Depends(get_db)):
    """Return all athletes."""
    return get_athletes(db)
