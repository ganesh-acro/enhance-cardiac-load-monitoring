"""
core/security/dependencies.py — FastAPI auth dependencies.

Dual-mode authentication:
  1. Try Auth0 RS256 token verification (if Auth0 is configured)
  2. Fall back to hand-rolled HS256 JWT verification

This allows both auth systems to work simultaneously during migration.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from core.database import get_db
from core.models import User
from core.security.jwt import decode_access_token
from core.security.auth0 import verify_auth0_token, is_auth0_configured, auth0_get_user

_bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — resolves the authenticated user from the Bearer token.

    Dual-mode:
      1. If Auth0 is configured, try RS256 verification first.
         Auth0 tokens contain the user's email in the payload — we look up
         the local User record by email.
      2. If Auth0 verification fails or is not configured, fall back to
         the hand-rolled HS256 JWT (which contains sub=user_id).

    Raises:
        401 if neither verification method succeeds.
        401 if the user no longer exists or is inactive.
    """
    token = credentials.credentials
    user = None

    # ── Attempt 1: Auth0 RS256 ───────────────────────────────────────────
    if is_auth0_configured():
        auth0_payload = verify_auth0_token(token)
        if auth0_payload is not None:
            auth0_sub = auth0_payload.get("sub")
            email = auth0_payload.get("email")

            if auth0_sub:
                # Try matching by auth0_id first
                user = db.query(User).filter(
                    User.auth0_id == auth0_sub,
                    User.is_active == True,
                ).first()

            # If no match by auth0_id and no email in token, fetch from Auth0 Management API
            if user is None and not email and auth0_sub:
                auth0_profile = auth0_get_user(auth0_sub)
                if auth0_profile:
                    email = auth0_profile.get("email")

            if user is None and email:
                user = db.query(User).filter(
                    User.email == email,
                    User.is_active == True,
                ).first()
                # Link the Auth0 ID to the local user on first login
                if user and not user.auth0_id and auth0_sub:
                    user.auth0_id = auth0_sub
                    db.commit()

            if user is not None:
                return user

    # ── Attempt 2: Hand-rolled HS256 JWT ─────────────────────────────────
    payload = decode_access_token(token)
    if payload is not None:
        user_id = payload.get("sub")
        if user_id is not None:
            user = db.query(User).filter(
                User.id == int(user_id),
                User.is_active == True,
            ).first()
            if user is not None:
                return user

    # ── Neither worked ───────────────────────────────────────────────────
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token.",
        headers={"WWW-Authenticate": "Bearer"},
    )


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
