"""
routers/athletes.py — GET /athletes
Returns the athlete registry.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.data import get_athletes
from core.security.dependencies import get_allowed_athlete_ids

router = APIRouter(prefix="/athletes", tags=["athletes"])


@router.get("")
def list_athletes(
    db: Session = Depends(get_db),
    allowed_ids: Optional[List[str]] = Depends(get_allowed_athlete_ids),
):
    """Return athletes visible to the current user."""
    return get_athletes(db, allowed_ids)
