"""
routers/history.py - Charging history endpoints
Provides access to completed charging session records.
Users can view their own history; admins can view all sessions.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/history", tags=["Charging History"])


@router.get("/", response_model=List[schemas.HistoryOut])
def get_charging_history(
    all: bool = Query(False, description="Admin only: return all users' history"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get charging history records.
    
    - Regular users: returns only their own charging history
    - Admins with ?all=true: returns all users' charging history
    
    Results include related station and charger details for display.
    Sorted by most recent session first.
    """
    query = (
        db.query(models.ChargingHistory)
        .options(
            joinedload(models.ChargingHistory.station),
            joinedload(models.ChargingHistory.charger)
        )
    )

    # Admin requesting all records vs user requesting their own
    if all and current_user.role == models.UserRole.admin:
        pass  # Return all records without user filter
    else:
        # Filter to only the current user's history
        query = query.filter(models.ChargingHistory.user_id == current_user.id)

    # Sort newest sessions first, apply pagination
    history = (
        query
        .order_by(models.ChargingHistory.started_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return history
