"""
core/security/dependencies.py — FastAPI auth dependencies (Auth0 only).
"""
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import User
from core.security.auth0 import verify_auth0_token, auth0_get_user

logger = logging.getLogger(__name__)

_bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolves the authenticated user from the Auth0 Bearer token.
    """
    token = credentials.credentials

    auth0_payload = verify_auth0_token(token)
    if auth0_payload is None:
        logger.warning("Auth0 token verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth0_sub = auth0_payload.get("sub")
    email = auth0_payload.get("email")
    logger.info(f"Auth0 token verified — sub: {auth0_sub}, email: {email}")
    user = None

    if auth0_sub:
        user = db.query(User).filter(
            User.auth0_id == auth0_sub,
            User.is_active == True,
        ).first()
        logger.info(f"Lookup by auth0_id: {'found' if user else 'not found'}")

    if user is None and not email and auth0_sub:
        logger.info("No email in token, fetching from Management API...")
        auth0_profile = auth0_get_user(auth0_sub)
        if auth0_profile:
            email = auth0_profile.get("email")
            logger.info(f"Got email from Management API: {email}")

    if user is None and email:
        user = db.query(User).filter(
            User.email == email,
            User.is_active == True,
        ).first()
        logger.info(f"Lookup by email: {'found' if user else 'not found'}")
        if user and not user.auth0_id and auth0_sub:
            user.auth0_id = auth0_sub
            db.commit()

    if user is None:
        logger.warning(f"No local user found for auth0_sub={auth0_sub}, email={email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
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
