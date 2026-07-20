"""
routers/auth.py - Authentication endpoints for EV ChargeHub
Handles user registration, login, token refresh, password management,
and returning the currently logged-in user's profile.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from .. import models, schemas
from ..auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from ..database import get_db
from ..dependencies import get_current_user

# Maximum failed login attempts before account lockout
MAX_FAILED_ATTEMPTS = 5

# Minutes to lock account after too many failed attempts
LOCKOUT_MINUTES = 15

# Create the auth router - all routes will be prefixed with /api/auth
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    Checks for duplicate email, hashes the password, saves the user,
    and returns access + refresh tokens along with the user profile.
    """
    # Check if a user with this email already exists
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Check if username is taken (if provided)
    if user_data.username:
        taken = db.query(models.User).filter(models.User.username == user_data.username).first()
        if taken:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken."
            )

    # Hash the plain-text password before storing
    hashed_password = get_password_hash(user_data.password)

    # Create the new user record
    new_user = models.User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        phone=user_data.phone,
        password_hash=hashed_password,
        role=models.UserRole.user,  # All new registrations are regular users
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT tokens for immediate login after registration
    token_data = {"sub": new_user.email, "role": new_user.role.value}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": new_user,
    }


@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Login with email and password.
    Implements account lockout after 5 failed attempts (15 minute lock).
    Returns access + refresh tokens on success.
    """
    # Find user by email
    user = db.query(models.User).filter(models.User.email == login_data.email).first()

    if not user:
        # Don't reveal whether email exists - use generic message
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Check if account is blocked by admin
    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked. Please contact support."
        )

    # Check if account is temporarily locked due to failed login attempts
    if user.locked_until and user.locked_until > datetime.utcnow():
        remaining_seconds = int((user.locked_until - datetime.utcnow()).total_seconds())
        remaining_minutes = remaining_seconds // 60
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account temporarily locked due to multiple failed login attempts. "
                   f"Try again in {remaining_minutes + 1} minute(s)."
        )

    # Verify the password
    if not verify_password(login_data.password, user.password_hash):
        # Increment failed login counter
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1

        # Lock account if max attempts reached
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Too many failed attempts. Account locked for {LOCKOUT_MINUTES} minutes."
            )

        db.commit()
        attempts_left = MAX_FAILED_ATTEMPTS - user.failed_login_attempts
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid email or password. {attempts_left} attempt(s) remaining before lockout."
        )

    # Successful login - reset failed attempt counter and lock
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()
    db.refresh(user)

    # Generate JWT tokens
    token_data = {"sub": user.email, "role": user.role.value}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/refresh", response_model=schemas.AccessTokenResponse)
def refresh_token(token_data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Obtain a new access token using a valid refresh token.
    Refresh tokens are long-lived (7 days) and used to avoid frequent re-logins.
    """
    # Decode and validate the refresh token
    payload = verify_token(token_data.refresh_token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    # Ensure this is actually a refresh token, not an access token
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type. Please provide a refresh token."
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload."
        )

    # Verify user still exists and is not blocked
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is blocked."
        )

    # Issue a new access token
    new_access_token = create_access_token(data={"sub": user.email, "role": user.role.value})

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


@router.post("/forgot-password", response_model=schemas.MessageResponse)
def forgot_password(request_data: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request a password reset link.
    In production, this would send an email. For now it returns a success message
    regardless (to avoid revealing whether an email is registered).
    """
    # NOTE: In production, generate a reset token and email it.
    # We check if user exists but always return the same response for security.
    user = db.query(models.User).filter(models.User.email == request_data.email).first()

    # Always return success to prevent email enumeration attacks
    return {"message": "If that email is registered, a password reset link would be sent."}


@router.post("/reset-password", response_model=schemas.MessageResponse)
def reset_password(request_data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using a reset token.
    In production, this would validate the reset token from the email link.
    For now, it returns a success message as a placeholder.
    """
    # NOTE: In production, validate the token, find the user, and update password.
    # This is a placeholder implementation.
    return {"message": "Password reset successful. Please login with your new password."}


@router.get("/me", response_model=schemas.UserOut)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    """
    Get the currently authenticated user's profile.
    Requires a valid access token in the Authorization header.
    """
    return current_user
