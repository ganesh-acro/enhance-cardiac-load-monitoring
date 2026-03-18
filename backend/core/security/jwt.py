"""
core/security/jwt.py — JWT creation and decoding utilities.
Reads SECRET_KEY, TOKEN_EXPIRATION_MINUTES, REFRESH_TOKEN_EXPIRATION_DAYS from environment.
"""
import os
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

# ── Secret key validation ────────────────────────────────────────────────────
SECRET_KEY: str = os.environ["SECRET_KEY"]

_BANNED_KEYS = {
    "enhance-super-secret-jwt-key-change-in-production",
    "changeme",
    "secret",
}
if SECRET_KEY.lower() in _BANNED_KEYS or len(SECRET_KEY) < 32:
    raise RuntimeError(
        "SECRET_KEY is insecure or too short (min 32 chars). "
        "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
    )

ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("TOKEN_EXPIRATION_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRATION_DAYS", "7"))


def create_access_token(data: dict) -> str:
    """
    Encode a JWT access token.

    Args:
        data: Payload dict — must include 'sub' (user id as str), 'email', 'role'.

    Returns:
        Signed JWT string.
    """
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload["exp"] = expire
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """
    Decode and validate a JWT access token.

    Returns:
        Decoded payload dict if valid, None if expired or malformed.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


# ── Refresh token helpers ────────────────────────────────────────────────────

def generate_refresh_token() -> str:
    """Generate a cryptographically random opaque refresh token."""
    return secrets.token_urlsafe(64)


def refresh_token_expiry() -> datetime:
    """Return the expiration datetime for a new refresh token."""
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
