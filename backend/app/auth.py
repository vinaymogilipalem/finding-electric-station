"""
auth.py - JWT token creation/verification and password hashing utilities
Provides all authentication-related functions used across the app.
Uses python-jose for JWT and passlib[bcrypt] for password hashing.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt

# Patch passlib bcrypt issue with Python 3.14 / bcrypt 4.1.0+
import bcrypt
if not hasattr(bcrypt, "__about__"):
    class About:
        __version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = About

_orig_hashpw = bcrypt.hashpw
def _patched_hashpw(password, salt):
    if isinstance(password, str):
        password = password.encode('utf-8')
    if len(password) > 72:
        password = password[:72]
    return _orig_hashpw(password, salt)
bcrypt.hashpw = _patched_hashpw

if hasattr(bcrypt, "checkpw"):
    _orig_checkpw = bcrypt.checkpw
    def _patched_checkpw(password, hashed_password):
        if isinstance(password, str):
            password = password.encode('utf-8')
        if len(password) > 72:
            password = password[:72]
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return _orig_checkpw(password, hashed_password)
    bcrypt.checkpw = _patched_checkpw

from passlib.context import CryptContext

# ─────────────────────────────────────────
# CONFIGURATION
# Loaded dynamically from environment variables (fallback to development defaults)
# ─────────────────────────────────────────
import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=env_path)

# Secret key used to sign JWT tokens - CHANGE IN PRODUCTION
SECRET_KEY = os.getenv("SECRET_KEY", "ev-chargehub-secret-key-change-in-production-2024")

# JWT signing algorithm (HS256 = HMAC with SHA-256)
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Access tokens expire after 60 minutes for security
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Refresh tokens stay valid for 7 days
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))


# ─────────────────────────────────────────
# PASSWORD HASHING
# bcrypt automatically salts and hashes passwords
# ─────────────────────────────────────────

# Create a passlib CryptContext using bcrypt scheme
# deprecated="auto" will automatically handle old hash formats
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    Returns a secure hash string that can be stored in the database.
    The original password CANNOT be recovered from the hash.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compare a plain-text password against a stored bcrypt hash.
    Returns True if they match, False otherwise.
    Safe against timing attacks (constant time comparison).
    """
    return pwd_context.verify(plain_password, hashed_password)


# ─────────────────────────────────────────
# JWT TOKEN FUNCTIONS
# ─────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a short-lived JWT access token.
    The token encodes the user's data (e.g. email, role) and expires
    after ACCESS_TOKEN_EXPIRE_MINUTES minutes (default 60 min).
    
    Args:
        data: Dictionary of claims to encode (e.g. {"sub": email, "role": role})
        expires_delta: Optional custom expiration duration
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Add standard JWT claims
    to_encode.update({
        "exp": expire,
        "type": "access"  # Mark token type so refresh tokens can't be used as access tokens
    })

    # Encode and sign the token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Create a long-lived JWT refresh token.
    Used to obtain new access tokens without re-authenticating.
    Expires after REFRESH_TOKEN_EXPIRE_DAYS days (default 7 days).
    
    Args:
        data: Dictionary of claims to encode
    
    Returns:
        Encoded JWT refresh token string
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({
        "exp": expire,
        "type": "refresh"  # Mark as refresh token to distinguish from access tokens
    })

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT token.
    Checks signature and expiration automatically.
    
    Args:
        token: JWT token string to verify
    
    Returns:
        The decoded payload dict if valid, or None if invalid/expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # Token is invalid (bad signature, expired, malformed, etc.)
        return None
