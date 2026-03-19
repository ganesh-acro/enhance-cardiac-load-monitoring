"""
api/auth.py — Authentication and user-management endpoints.
Handles login, token refresh, logout, and admin CRUD on users.
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session as DBSession

from core.database import get_db
from core.models import User, Athlete, RefreshToken, LoginHistory
from core.security.password import hash_password, verify_password
from core.security.jwt import (
    create_access_token,
    generate_refresh_token,
    refresh_token_expiry,
)
from core.security.dependencies import require_admin, get_current_user
from core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Request / Response schemas ────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "coach"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: str

    class Config:
        from_attributes = True


class UpdateUserRequest(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None


class ResetPasswordRequest(BaseModel):
    new_password: str


class AssignAthletesRequest(BaseModel):
    athlete_ids: list[str]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, body: LoginRequest, db: DBSession = Depends(get_db)):
    """
    Authenticate a user and return access + refresh tokens.
    Returns 401 for any credential failure — intentionally vague to
    prevent user enumeration.
    Rate-limited to 5 attempts per minute per IP.
    """
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled.",
        )

    access = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
    })

    raw_refresh = generate_refresh_token()
    db.add(RefreshToken(
        token=raw_refresh,
        user_id=user.id,
        expires_at=refresh_token_expiry(),
    ))

    # Record login event
    db.add(LoginHistory(
        user_id=user.id,
        ip_address=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("user-agent", "unknown"),
    ))
    db.commit()

    return TokenResponse(access_token=access, refresh_token=raw_refresh)


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: DBSession = Depends(get_db)):
    """
    Exchange a valid refresh token for a new access + refresh token pair.
    The old refresh token is revoked (token rotation).
    """
    stored = db.query(RefreshToken).filter(
        RefreshToken.token == body.refresh_token,
        RefreshToken.revoked == False,
    ).first()

    if not stored or stored.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    user = db.query(User).filter(User.id == stored.user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found or inactive.")

    # Revoke old refresh token
    stored.revoked = True

    # Issue new pair
    access = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
    })
    new_refresh = generate_refresh_token()
    db.add(RefreshToken(
        token=new_refresh,
        user_id=user.id,
        expires_at=refresh_token_expiry(),
    ))
    db.commit()

    return TokenResponse(access_token=access, refresh_token=new_refresh)


@router.post("/logout")
def logout(db: DBSession = Depends(get_db), user: User = Depends(get_current_user)):
    """Revoke all refresh tokens for the current user."""
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id,
        RefreshToken.revoked == False,
    ).update({"revoked": True})
    db.commit()
    return {"detail": "Logged out."}


@router.get("/me")
def get_profile(db: DBSession = Depends(get_db), user: User = Depends(get_current_user)):
    """Return the current user's profile info."""
    # Admin sees all athletes; coaches see only assigned ones
    if user.role == "admin":
        athletes_list = [
            {"id": a.id, "name": a.name}
            for a in db.query(Athlete).order_by(Athlete.name).all()
        ]
    else:
        athletes_list = [
            {
                "id": a.id,
                "name": a.name,
                "sport": a.sport,
                "age": a.age,
                "height": a.height,
                "weight": a.weight,
                "gender": a.gender,
            }
            for a in user.assigned_athletes
        ]

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "assigned_athletes": athletes_list,
    }


@router.get("/me/login-history")
def get_login_history(
    db: DBSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return the current user's login history, most recent first."""
    entries = (
        db.query(LoginHistory)
        .filter(LoginHistory.user_id == user.id)
        .order_by(LoginHistory.logged_in_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": e.id,
            "ip_address": e.ip_address,
            "user_agent": e.user_agent,
            "logged_in_at": e.logged_in_at.isoformat() if e.logged_in_at else None,
        }
        for e in entries
    ]


@router.delete("/me/login-history")
def clear_login_history(
    db: DBSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete all login history for the current user."""
    db.query(LoginHistory).filter(LoginHistory.user_id == user.id).delete()
    db.commit()
    return {"detail": "Login history cleared."}


@router.patch("/me/password")
def change_own_password(
    body: ResetPasswordRequest,
    db: DBSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Change the current user's password."""
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    user.password_hash = hash_password(body.new_password)
    db.commit()
    return {"detail": "Password changed successfully."}


@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(
    body: CreateUserRequest,
    db: DBSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new user. Admin only."""
    if body.role not in ("admin", "coach", "athlete"):
        raise HTTPException(status_code=400, detail="Invalid role.")

    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    db.commit()

    return {"detail": f"User '{body.name}' created with role '{body.role}'."}


# ── Admin User Management ─────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: DBSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all users. Admin only."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at.isoformat() if u.created_at else "",
        )
        for u in users
    ]


@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    body: UpdateUserRequest,
    db: DBSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a user's role or active status. Admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if body.role is not None:
        if body.role not in ("admin", "coach", "athlete"):
            raise HTTPException(status_code=400, detail="Invalid role.")
        user.role = body.role

    if body.is_active is not None:
        if user.id == admin.id and not body.is_active:
            raise HTTPException(status_code=400, detail="Cannot deactivate yourself.")
        user.is_active = body.is_active

    db.commit()
    return {"detail": "User updated."}


@router.patch("/users/{user_id}/password")
def reset_user_password(
    user_id: int,
    body: ResetPasswordRequest,
    db: DBSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Reset a user's password. Admin only."""
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = hash_password(body.new_password)
    db.commit()
    return {"detail": "Password reset successfully."}


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    db: DBSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a user. Admin only. Cannot delete yourself."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    db.delete(user)
    db.commit()
    return {"detail": "User deleted."}


# ── Coach–Athlete Assignment ─────────────────────────────────────────────────

@router.get("/users/{user_id}/athletes")
def get_assigned_athletes(
    user_id: int,
    db: DBSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Get athlete IDs assigned to a user. Admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return [a.id for a in user.assigned_athletes]


@router.put("/users/{user_id}/athletes")
def set_assigned_athletes(
    user_id: int,
    body: AssignAthletesRequest,
    db: DBSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Replace athlete assignments for a user. Admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    athletes = db.query(Athlete).filter(Athlete.id.in_(body.athlete_ids)).all()
    user.assigned_athletes = athletes
    db.commit()
    return {"detail": f"{len(athletes)} athlete(s) assigned."}
