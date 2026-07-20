"""
routers/users.py - User management endpoints for EV ChargeHub
Admin endpoints for listing/managing users, and self-service endpoints
for users to update their own profile or change their password.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..auth import verify_password, get_password_hash
from ..database import get_db
from ..dependencies import get_current_user, get_admin_user

# All routes prefixed with /api/users
router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/", response_model=List[schemas.UserOut])
def list_users(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] List all registered users with pagination.
    
    - skip: Number of records to skip (for pagination)
    - limit: Maximum number of records to return
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users


@router.get("/me/profile", response_model=schemas.UserOut)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    """
    Get the currently authenticated user's own profile.
    Any logged-in user can access this endpoint.
    """
    return current_user


@router.put("/me/profile", response_model=schemas.UserOut)
def update_my_profile(
    update_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update the currently authenticated user's profile.
    Users can update their username, full_name, and phone number.
    """
    # Check if new username is already taken by another user
    if update_data.username and update_data.username != current_user.username:
        taken = db.query(models.User).filter(
            models.User.username == update_data.username,
            models.User.id != current_user.id
        ).first()
        if taken:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken."
            )

    # Apply only the provided fields (non-None values)
    if update_data.username is not None:
        current_user.username = update_data.username
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.phone is not None:
        current_user.phone = update_data.phone

    from datetime import datetime
    current_user.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password", response_model=schemas.MessageResponse)
def change_my_password(
    password_data: schemas.UserPasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Change the current user's password.
    Requires the current password for verification before updating.
    """
    # Verify the current password is correct
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    # Prevent using the same password again
    if verify_password(password_data.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password."
        )

    # Hash and save the new password
    current_user.password_hash = get_password_hash(password_data.new_password)

    from datetime import datetime
    current_user.updated_at = datetime.utcnow()

    db.commit()
    return {"message": "Password changed successfully."}


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] Get a specific user by their ID.
    Returns 404 if the user is not found.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )
    return user


@router.put("/{user_id}/block", response_model=schemas.UserOut)
def toggle_block_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] Toggle block/unblock a user account.
    Blocked users cannot login or access the API.
    Admins cannot block other admins.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )

    # Prevent admins from blocking themselves or other admins
    if user.role == models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot block admin accounts."
        )

    # Toggle the blocked status
    user.is_blocked = not user.is_blocked
    action_word = "blocked" if user.is_blocked else "unblocked"

    from datetime import datetime
    user.updated_at = datetime.utcnow()

    # Write an audit log entry for this action
    audit = models.AuditLog(
        user_id=admin.id,
        action="BLOCK" if user.is_blocked else "UNBLOCK",
        entity="User",
        entity_id=user.id,
        details=f"Admin {admin.email} {action_word} user {user.email}",
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    return user


@router.delete("/{user_id}", response_model=schemas.MessageResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] Permanently delete a user account.
    This cannot be undone. Related records (bookings, history, etc.) are
    cascade-deleted based on model relationship configuration.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )

    # Prevent admin from deleting themselves
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins cannot delete their own account."
        )

    user_email = user.email
    db.delete(user)
    db.commit()

    return {"message": f"User {user_email} has been permanently deleted."}
