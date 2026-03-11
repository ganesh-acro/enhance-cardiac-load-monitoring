"""
core/security/jwt.py — JWT creation and decoding utilities.
Reads SECRET_KEY and TOKEN_EXPIRATION_MINUTES from environment.
"""
import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

SECRET_KEY: str = os.environ["SECRET_KEY"]
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("TOKEN_EXPIRATION_MINUTES", "60"))


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
