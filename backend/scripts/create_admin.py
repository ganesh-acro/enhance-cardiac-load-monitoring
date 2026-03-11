"""
Create the default admin user.

Usage:
    cd backend
    python -m scripts.create_admin

Safe to re-run — skips creation if the email already exists.
"""
import sys
import os

# Ensure backend root is on the path when run directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal, engine, Base
from core.models import User  # noqa: F401 — registers User on Base
from core.security.password import hash_password

ADMIN_NAME = "AcroEnhance Admin"
ADMIN_EMAIL = "acroenhance@gmail.com"
ADMIN_PASSWORD = "Acroenhance@123"
ADMIN_ROLE = "admin"


def create_admin() -> None:
    # Ensure all tables exist before querying
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            print(f"[skip] Admin account already exists: {ADMIN_EMAIL}")
            return

        admin = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role=ADMIN_ROLE,
        )
        db.add(admin)
        db.commit()
        print(f"[ok]   Admin account created: {ADMIN_EMAIL} (role: {ADMIN_ROLE})")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
