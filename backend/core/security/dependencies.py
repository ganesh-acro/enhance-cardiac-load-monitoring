"""
core/security/dependencies.py — FastAPI auth dependency.
Extracts and validates the Bearer JWT on every protected request.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import User
from core.security.jwt import decode_access_token

_bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — resolves the authenticated user from the Bearer token.

    Raises:
        401 if the token is missing, expired, or invalid.
        401 if the user no longer exists or is inactive.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: int | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Restrict access to admin users only."""
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return user


def require_coach_or_above(user: User = Depends(get_current_user)) -> User:
    """Restrict access to coach or admin users."""
    if user.role not in ("admin", "coach"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required.",
        )
    return user


def get_allowed_athlete_ids(user: User = Depends(require_coach_or_above)):
    """
    Returns list of athlete IDs the user can access, or None (meaning all).
    Admins get None (unrestricted). Coaches get their assigned athlete IDs.
    """
    if user.role == "admin":
        return None
    return [a.id for a in user.assigned_athletes]
