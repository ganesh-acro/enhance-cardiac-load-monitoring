"""
core/security/auth0.py — Auth0 RS256 token verification.

Fetches JWKS (JSON Web Key Set) from Auth0, caches the public keys,
and verifies incoming RS256 JWT access tokens.

When AUTH0_DOMAIN is not configured, all functions gracefully return None
so the app falls back to the hand-rolled HS256 JWT system.
"""
import os
import time
import logging
from typing import Any, Dict, Optional

import httpx
from jose import jwt, JWTError

logger = logging.getLogger(__name__)

# ── Configuration ────────────────────────────────────────────────────────────

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "").strip()
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE", "").strip()
AUTH0_ALGORITHMS = ["RS256"]

# Management API credentials (for admin user creation)
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID", "").strip()
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET", "").strip()


def is_auth0_configured() -> bool:
    """Check if Auth0 environment variables are set."""
    return bool(AUTH0_DOMAIN and AUTH0_AUDIENCE)


def is_management_api_configured() -> bool:
    """Check if Auth0 Management API credentials are set."""
    return bool(AUTH0_DOMAIN and AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET)


# ── JWKS Cache ───────────────────────────────────────────────────────────────

_jwks_cache: Dict[str, Any] = {}
_jwks_cache_expiry: float = 0
_JWKS_CACHE_TTL = 3600  # 1 hour


def _get_jwks() -> Dict[str, Any]:
    """Fetch and cache Auth0 JWKS (public keys for RS256 verification)."""
    global _jwks_cache, _jwks_cache_expiry

    if _jwks_cache and time.time() < _jwks_cache_expiry:
        return _jwks_cache

    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    try:
        response = httpx.get(jwks_url, timeout=10.0)
        response.raise_for_status()
        _jwks_cache = response.json()
        _jwks_cache_expiry = time.time() + _JWKS_CACHE_TTL
        return _jwks_cache
    except Exception as e:
        logger.error(f"Failed to fetch Auth0 JWKS: {e}")
        # Return stale cache if available
        if _jwks_cache:
            return _jwks_cache
        return {}


def _get_signing_key(token: str) -> Optional[Dict[str, Any]]:
    """Extract the correct signing key from JWKS based on the token's kid header."""
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        return None

    jwks = _get_jwks()
    if not jwks or "keys" not in jwks:
        return None

    kid = unverified_header.get("kid")
    for key in jwks["keys"]:
        if key.get("kid") == kid:
            return key

    return None


# ── Token Verification ───────────────────────────────────────────────────────

def verify_auth0_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify an Auth0 RS256 JWT access token.

    Returns the decoded payload if valid, or None if:
    - Auth0 is not configured
    - The token is not an Auth0 token (wrong issuer/algorithm)
    - Verification fails

    The caller can then fall back to HS256 verification.
    """
    if not is_auth0_configured():
        return None

    signing_key = _get_signing_key(token)
    if signing_key is None:
        return None

    try:
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=AUTH0_ALGORITHMS,
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/",
        )
        return payload
    except JWTError as e:
        logger.debug(f"Auth0 token verification failed: {e}")
        return None


# ── Management API ───────────────────────────────────────────────────────────

_mgmt_token_cache: Optional[str] = None
_mgmt_token_expiry: float = 0


def _get_management_token() -> Optional[str]:
    """Get an Auth0 Management API access token (cached)."""
    global _mgmt_token_cache, _mgmt_token_expiry

    if not is_management_api_configured():
        return None

    if _mgmt_token_cache and time.time() < _mgmt_token_expiry:
        return _mgmt_token_cache

    url = f"https://{AUTH0_DOMAIN}/oauth/token"
    payload = {
        "grant_type": "client_credentials",
        "client_id": AUTH0_CLIENT_ID,
        "client_secret": AUTH0_CLIENT_SECRET,
        "audience": f"https://{AUTH0_DOMAIN}/api/v2/",
    }

    try:
        response = httpx.post(url, json=payload, timeout=10.0)
        response.raise_for_status()
        data = response.json()
        _mgmt_token_cache = data["access_token"]
        # Cache for slightly less than the expiry to avoid edge cases
        _mgmt_token_expiry = time.time() + data.get("expires_in", 86400) - 60
        return _mgmt_token_cache
    except Exception as e:
        logger.error(f"Failed to get Auth0 Management API token: {e}")
        return None


def auth0_create_user(email: str, password: str, name: str) -> Optional[Dict[str, Any]]:
    """
    Create a user in Auth0 via the Management API.
    Returns the Auth0 user object on success, or None on failure.
    """
    token = _get_management_token()
    if not token:
        return None

    url = f"https://{AUTH0_DOMAIN}/api/v2/users"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "email": email,
        "password": password,
        "name": name,
        "connection": "Username-Password-Authentication",
        "email_verified": False,  # Auth0 will send verification email
    }

    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=10.0)
        response.raise_for_status()
        user_data = response.json()

        # Send verification email
        try:
            job_url = f"https://{AUTH0_DOMAIN}/api/v2/jobs/verification-email"
            job_payload = {
                "user_id": user_data["user_id"],
            }
            print(f"[AUTH0] Sending verification email for {user_data['user_id']}...")
            ver_resp = httpx.post(job_url, json=job_payload, headers=headers, timeout=10.0)
            print(f"[AUTH0] Verification email response: {ver_resp.status_code} {ver_resp.text}")
            ver_resp.raise_for_status()
        except Exception as e:
            print(f"[AUTH0] Failed to send verification email: {e}")

        return user_data
    except httpx.HTTPStatusError as e:
        logger.error(f"Auth0 create user failed: {e.response.status_code} {e.response.text}")
        return None
    except Exception as e:
        logger.error(f"Auth0 create user failed: {e}")
        return None


def auth0_delete_user(auth0_id: str) -> bool:
    """Delete a user from Auth0 via the Management API."""
    token = _get_management_token()
    if not token:
        return False

    url = f"https://{AUTH0_DOMAIN}/api/v2/users/{auth0_id}"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = httpx.delete(url, headers=headers, timeout=10.0)
        response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Auth0 delete user failed: {e}")
        return False


def auth0_change_password(auth0_id: str, new_password: str) -> bool:
    """Change a user's password in Auth0 via the Management API."""
    token = _get_management_token()
    if not token:
        return False

    url = f"https://{AUTH0_DOMAIN}/api/v2/users/{auth0_id}"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"password": new_password, "connection": "Username-Password-Authentication"}

    try:
        response = httpx.patch(url, json=payload, headers=headers, timeout=10.0)
        response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Auth0 change password failed: {e}")
        return False


def auth0_block_user(auth0_id: str, blocked: bool = True) -> bool:
    """Block or unblock a user in Auth0."""
    token = _get_management_token()
    if not token:
        return False

    url = f"https://{AUTH0_DOMAIN}/api/v2/users/{auth0_id}"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"blocked": blocked}

    try:
        response = httpx.patch(url, json=payload, headers=headers, timeout=10.0)
        response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Auth0 block user failed: {e}")
        return False


def auth0_get_user(auth0_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a user's profile from Auth0 by their auth0_id (sub)."""
    token = _get_management_token()
    if not token:
        return None

    url = f"https://{AUTH0_DOMAIN}/api/v2/users/{auth0_id}"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = httpx.get(url, headers=headers, timeout=10.0)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Auth0 get user failed: {e}")
        return None
