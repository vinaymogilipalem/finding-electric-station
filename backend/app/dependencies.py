"""
dependencies.py - FastAPI dependency functions for authentication and authorization
These functions are injected into route handlers using FastAPI's Depends() system.
They validate JWT tokens and enforce role-based access control.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models
from .auth import verify_token
from .database import get_db

# OAuth2PasswordBearer tells FastAPI where to extract the token from
# tokenUrl is the login endpoint (used by Swagger UI's Authorize button)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    FastAPI dependency: Extract and validate the JWT access token from the request.
    Looks up the user in the database and returns the User model instance.
    
    Raises HTTP 401 if:
    - Token is missing, malformed, or expired
    - Token type is not 'access'
    - User is not found in the database
    - User account is blocked
    
    Usage in route:
        @router.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user)):
            ...
    """
    # Standard 401 exception to raise on auth failures
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verify and decode the JWT token
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    # Ensure this is an access token (not a refresh token)
    if payload.get("type") != "access":
        raise credentials_exception

    # Extract the user's email from the token subject claim
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    # Look up the user in the database
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception

    # Reject blocked accounts
    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked. Please contact support."
        )

    return user


def get_admin_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """
    FastAPI dependency: Ensure the current user has admin role.
    Extends get_current_user by adding an admin role check.
    
    Raises HTTP 403 if the user is not an admin.
    
    Usage in route:
        @router.get("/admin-only")
        def admin_route(admin: User = Depends(get_admin_user)):
            ...
    """
    if current_user.role != models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to access this resource."
        )
    return current_user


def get_optional_user(
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)),
    db: Session = Depends(get_db)
):
    """
    FastAPI dependency: Optionally extract the current user.
    Returns the User if a valid token is present, otherwise returns None.
    Useful for endpoints that behave differently for authenticated vs. anonymous users.
    """
    if token is None:
        return None
    try:
        payload = verify_token(token)
        if payload is None or payload.get("type") != "access":
            return None
        email = payload.get("sub")
        if email is None:
            return None
        user = db.query(models.User).filter(models.User.email == email).first()
        return user
    except Exception:
        return None
