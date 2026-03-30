"""
Create the default admin user via Auth0.

Usage:
    cd backend
    python -m scripts.create_admin

Safe to re-run — skips creation if the email already exists.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal, engine, Base
from core.models import User  # noqa: F401 — registers User on Base
from core.security.auth0 import auth0_create_user

ADMIN_NAME = "AcroEnhance Admin"
ADMIN_EMAIL = "acroenhance@gmail.com"
ADMIN_PASSWORD = "Acroenhance@123"
ADMIN_ROLE = "admin"


def create_admin() -> None:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            print(f"[skip] Admin account already exists: {ADMIN_EMAIL}")
            return

        auth0_user = auth0_create_user(
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            name=ADMIN_NAME,
        )
        auth0_id = auth0_user.get("user_id") if auth0_user else None

        if not auth0_id:
            print("[error] Failed to create admin in Auth0. Check Auth0 credentials.")
            return

        admin = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            auth0_id=auth0_id,
            role=ADMIN_ROLE,
        )
        db.add(admin)
        db.commit()
        print(f"[ok]   Admin account created: {ADMIN_EMAIL} (role: {ADMIN_ROLE})")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
