"""
api/auth.py — Authentication and user-management endpoints (Auth0 only).

Auth0 handles all login/logout/token flows client-side.
This module provides: user profile, admin user management, athlete assignments.
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session as DBSession

from core.database import get_db
from core.models import User, Athlete, LoginHistory
from core.security.dependencies import require_admin, get_current_user
from core.security.auth0 import (
    auth0_create_user,
    auth0_delete_user,
    auth0_change_password,
    auth0_block_user,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Request / Response schemas ────────────────────────────────────────────────

class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "coach"


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

@router.get("/me")
def get_profile(db: DBSession = Depends(get_db), user: User = Depends(get_current_user)):
    """Return the current user's profile info."""
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
    user: User = Depends(get_current_user),
):
    """Change the current user's password in Auth0."""
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    if not user.auth0_id:
        raise HTTPException(status_code=400, detail="No Auth0 account linked.")

    if not auth0_change_password(user.auth0_id, body.new_password):
        raise HTTPException(status_code=500, detail="Failed to update password in Auth0.")

    return {"detail": "Password changed successfully."}


# ── Admin User Management ─────────────────────────────────────────────────────

@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(
    body: CreateUserRequest,
    db: DBSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new user in Auth0 + local DB. Admin only."""
    if body.role not in ("admin", "coach", "athlete"):
        raise HTTPException(status_code=400, detail="Invalid role.")

    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    auth0_user = auth0_create_user(
        email=body.email,
        password=body.password,
        name=body.name,
    )
    if not auth0_user:
        raise HTTPException(status_code=500, detail="Failed to create user in Auth0.")

    auth0_id = auth0_user.get("user_id")

    user = User(
        name=body.name,
        email=body.email,
        auth0_id=auth0_id,
        role=body.role,
    )
    db.add(user)
    db.commit()

    return {"detail": f"User '{body.name}' created with role '{body.role}'."}


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

        if user.auth0_id:
            auth0_block_user(user.auth0_id, blocked=not body.is_active)

    db.commit()
    return {"detail": "User updated."}


@router.patch("/users/{user_id}/password")
def reset_user_password(
    user_id: int,
    body: ResetPasswordRequest,
    db: DBSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Reset a user's password in Auth0. Admin only."""
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not user.auth0_id:
        raise HTTPException(status_code=400, detail="User has no Auth0 account.")

    if not auth0_change_password(user.auth0_id, body.new_password):
        raise HTTPException(status_code=500, detail="Failed to update password in Auth0.")

    return {"detail": "Password reset successfully."}


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    db: DBSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a user from Auth0 + local DB. Admin only."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.auth0_id:
        if not auth0_delete_user(user.auth0_id):
            logger.warning(f"Failed to delete Auth0 user {user.auth0_id} — deleting locally anyway")

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
