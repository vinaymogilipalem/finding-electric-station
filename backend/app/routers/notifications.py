"""
routers/notifications.py - Notifications endpoints for EV ChargeHub
Handles listing and marking notifications as read.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/", response_model=List[schemas.NotificationOut])
def get_my_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all notifications for the logged-in user.
    """
    return db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()


@router.put("/{id}/read", response_model=schemas.NotificationOut)
def mark_as_read(
    id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a specific notification as read.
    """
    notif = db.query(models.Notification).filter(
        models.Notification.id == id,
        models.Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.put("/read-all", response_model=schemas.MessageResponse)
def mark_all_as_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications of the logged-in user as read.
    """
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({models.Notification.is_read: True}, synchronize_session=False)

    db.commit()
    return {"message": "All notifications marked as read"}
