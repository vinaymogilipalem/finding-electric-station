"""
routers/chargers.py - EV Charger management endpoints
Admin-protected endpoints for adding/updating/deleting chargers,
and public endpoint to view chargers at a station.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, get_admin_user

router = APIRouter(prefix="/api/chargers", tags=["Chargers"])


@router.get("/station/{station_id}", response_model=List[schemas.ChargerOut])
def get_chargers_for_station(station_id: int, db: Session = Depends(get_db)):
    """
    Get all chargers at a specific station.
    Publicly accessible - no authentication required.
    Returns an empty list if the station has no chargers.
    """
    # Verify the station exists first
    station = db.query(models.Station).filter(models.Station.id == station_id).first()
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station with ID {station_id} not found."
        )

    chargers = db.query(models.Charger).filter(models.Charger.station_id == station_id).all()
    return chargers


@router.post("/", response_model=schemas.ChargerOut, status_code=status.HTTP_201_CREATED)
def create_charger(
    charger_data: schemas.ChargerCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] Add a new charger to an existing station.
    The station must exist before adding a charger.
    """
    # Verify the station exists
    station = db.query(models.Station).filter(models.Station.id == charger_data.station_id).first()
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station with ID {charger_data.station_id} not found."
        )

    # Create the charger record
    new_charger = models.Charger(**charger_data.model_dump())
    db.add(new_charger)
    db.commit()
    db.refresh(new_charger)

    return new_charger


@router.put("/{charger_id}", response_model=schemas.ChargerOut)
def update_charger(
    charger_id: int,
    update_data: schemas.ChargerUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] Update charger details such as type, power, price, or connector.
    Only the provided fields are updated (partial update supported).
    """
    charger = db.query(models.Charger).filter(models.Charger.id == charger_id).first()
    if not charger:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Charger with ID {charger_id} not found."
        )

    # Apply only the non-None fields from the update payload
    update_fields = update_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(charger, field, value)

    db.commit()
    db.refresh(charger)
    return charger


@router.delete("/{charger_id}", response_model=schemas.MessageResponse)
def delete_charger(
    charger_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] Permanently delete a charger from a station.
    Cannot delete a charger that has active (confirmed) bookings.
    """
    charger = db.query(models.Charger).filter(models.Charger.id == charger_id).first()
    if not charger:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Charger with ID {charger_id} not found."
        )

    # Check for active bookings that would be affected
    active_bookings = db.query(models.Booking).filter(
        models.Booking.charger_id == charger_id,
        models.Booking.status.in_([models.BookingStatus.pending, models.BookingStatus.confirmed])
    ).count()

    if active_bookings > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete charger with {active_bookings} active booking(s). Cancel them first."
        )

    db.delete(charger)
    db.commit()

    return {"message": f"Charger ID {charger_id} has been deleted."}


@router.put("/{charger_id}/status", response_model=schemas.ChargerOut)
def update_charger_status(
    charger_id: int,
    status_data: schemas.ChargerStatusUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] Update just the operational status of a charger.
    Allowed values: available, occupied, maintenance.
    This is separate from the full update endpoint for quick status changes.
    """
    charger = db.query(models.Charger).filter(models.Charger.id == charger_id).first()
    if not charger:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Charger with ID {charger_id} not found."
        )

    charger.status = status_data.status
    db.commit()
    db.refresh(charger)

    return charger
