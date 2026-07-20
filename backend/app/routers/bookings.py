"""
routers/bookings.py - Booking management endpoints
Handles creating, viewing, and cancelling EV charger bookings.
Includes overlap conflict detection to prevent double-booking the same charger.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import uuid

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, get_admin_user

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


def generate_booking_ref() -> str:
    """Generate a unique booking reference code like 'BCK-A1B2C3'"""
    return "BCK-" + str(uuid.uuid4()).upper()[:6]


def check_booking_conflict(db: Session, charger_id: int, booking_date: str,
                            start_time: str, end_time: str,
                            exclude_booking_id: Optional[int] = None) -> bool:
    """
    Check if a new booking overlaps with existing confirmed/pending bookings
    for the same charger on the same date.
    
    Overlap logic: Two time ranges [A_start, A_end] and [B_start, B_end] overlap if:
        A_start < B_end AND A_end > B_start
    
    Returns True if there is a conflict, False if the slot is free.
    """
    query = db.query(models.Booking).filter(
        models.Booking.charger_id == charger_id,
        models.Booking.booking_date == booking_date,
        models.Booking.status.in_([
            models.BookingStatus.pending,
            models.BookingStatus.confirmed
        ]),
        # Overlap detection: existing booking's start < new end AND existing end > new start
        models.Booking.start_time < end_time,
        models.Booking.end_time > start_time,
    )

    # Exclude the current booking when checking (for update scenarios)
    if exclude_booking_id:
        query = query.filter(models.Booking.id != exclude_booking_id)

    return query.count() > 0


@router.get("/", response_model=List[schemas.BookingOut])
def list_bookings(
    all: bool = Query(False, description="Admin only: return all users' bookings"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    List bookings.
    - Regular users: returns only their own bookings
    - Admins with ?all=true: returns all users' bookings
    
    Results include related station and charger info for display.
    """
    query = (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.station),
            joinedload(models.Booking.charger),
            joinedload(models.Booking.user)
        )
    )

    # If admin and requesting all bookings
    if all and current_user.role == models.UserRole.admin:
        pass  # No user filter - return all
    else:
        # Regular users or admin not using ?all=true - return own bookings only
        query = query.filter(models.Booking.user_id == current_user.id)

    bookings = query.order_by(models.Booking.created_at.desc()).offset(skip).limit(limit).all()
    return bookings


@router.get("/{booking_id}", response_model=schemas.BookingOut)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get a specific booking by ID.
    Users can only view their own bookings.
    Admins can view any booking.
    """
    booking = (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.station),
            joinedload(models.Booking.charger),
            joinedload(models.Booking.user)
        )
        .filter(models.Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with ID {booking_id} not found."
        )

    # Regular users can only see their own bookings
    if current_user.role != models.UserRole.admin and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this booking."
        )

    return booking


@router.post("/", response_model=schemas.BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new charger booking.
    
    Validates:
    - Station and charger must exist and be active
    - Charger must belong to the specified station
    - Charger must not be in maintenance
    - Time slot must not overlap with existing bookings
    - End time must be after start time
    
    Automatically:
    - Calculates total_amount based on charger price and duration
    - Generates a unique booking reference
    - Creates a notification for the user
    - Adds an audit log entry
    """
    # Verify station exists
    station = db.query(models.Station).filter(
        models.Station.id == booking_data.station_id,
        models.Station.is_active == True
    ).first()
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Station not found or is inactive."
        )

    # Verify charger exists and belongs to the specified station
    charger = db.query(models.Charger).filter(
        models.Charger.id == booking_data.charger_id,
        models.Charger.station_id == booking_data.station_id
    ).first()
    if not charger:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Charger not found at the specified station."
        )

    # Cannot book a charger that is under maintenance
    if charger.status == models.ChargerStatus.maintenance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This charger is currently under maintenance and cannot be booked."
        )

    # Validate time range: end must be after start
    start_parts = booking_data.start_time.split(":")
    end_parts = booking_data.end_time.split(":")
    start_minutes = int(start_parts[0]) * 60 + int(start_parts[1])
    end_minutes = int(end_parts[0]) * 60 + int(end_parts[1])

    if end_minutes <= start_minutes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time."
        )

    # Check for booking conflicts with same charger on same date
    has_conflict = check_booking_conflict(
        db,
        charger_id=booking_data.charger_id,
        booking_date=booking_data.booking_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time
    )

    if has_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This charger is already booked for the requested time slot. Please choose a different time."
        )

    # Calculate total cost based on duration and charger price per kWh
    # We estimate energy used from charger power and session duration
    duration_hours = (end_minutes - start_minutes) / 60.0
    estimated_energy_kwh = charger.power_kw * duration_hours * 0.85  # 85% efficiency
    total_amount = round(estimated_energy_kwh * charger.price_per_kwh, 2)

    # Create the booking record
    new_booking = models.Booking(
        booking_ref=generate_booking_ref(),
        user_id=current_user.id,
        station_id=booking_data.station_id,
        charger_id=booking_data.charger_id,
        booking_date=booking_data.booking_date,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        status=models.BookingStatus.confirmed,  # Auto-confirm for now
        payment_status=models.PaymentStatus.paid,  # Assume paid on booking
        total_amount=total_amount,
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # Create a notification to inform the user of successful booking
    notification = models.Notification(
        user_id=current_user.id,
        title="Booking Confirmed! 🔌",
        message=(
            f"Your booking at {station.name} has been confirmed. "
            f"Charger: {charger.charger_type.value} | "
            f"Date: {booking_data.booking_date} | "
            f"Time: {booking_data.start_time} - {booking_data.end_time} | "
            f"Ref: {new_booking.booking_ref}"
        ),
        type=models.NotificationType.booking,
    )
    db.add(notification)

    # Log this booking creation in audit trail
    audit = models.AuditLog(
        user_id=current_user.id,
        action="CREATE",
        entity="Booking",
        entity_id=new_booking.id,
        details=f"User {current_user.email} created booking {new_booking.booking_ref} at {station.name}"
    )
    db.add(audit)
    db.commit()

    # Reload with relationships for the response
    booking = (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.station),
            joinedload(models.Booking.charger),
            joinedload(models.Booking.user)
        )
        .filter(models.Booking.id == new_booking.id)
        .first()
    )

    return booking


@router.put("/{booking_id}/cancel", response_model=schemas.BookingOut)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Cancel a booking.
    - Regular users can cancel their own pending/confirmed bookings
    - Admins can cancel any booking
    - Completed bookings cannot be cancelled
    
    Cancellation triggers a notification and audit log entry.
    """
    booking = (
        db.query(models.Booking)
        .options(joinedload(models.Booking.station))
        .filter(models.Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with ID {booking_id} not found."
        )

    # Regular users can only cancel their own bookings
    if current_user.role != models.UserRole.admin and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings."
        )

    # Cannot cancel a completed booking
    if booking.status == models.BookingStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a completed booking."
        )

    # Cannot cancel an already cancelled booking
    if booking.status == models.BookingStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This booking is already cancelled."
        )

    # Update booking status to cancelled and mark refund
    booking.status = models.BookingStatus.cancelled
    booking.payment_status = models.PaymentStatus.refunded

    from datetime import datetime
    booking.updated_at = datetime.utcnow()

    # Create cancellation notification for the user
    notification = models.Notification(
        user_id=booking.user_id,
        title="Booking Cancelled",
        message=(
            f"Your booking (Ref: {booking.booking_ref}) at {booking.station.name} "
            f"on {booking.booking_date} has been cancelled. Refund will be processed."
        ),
        type=models.NotificationType.cancellation,
    )
    db.add(notification)

    # Audit log entry for cancellation
    audit = models.AuditLog(
        user_id=current_user.id,
        action="CANCEL",
        entity="Booking",
        entity_id=booking.id,
        details=f"Booking {booking.booking_ref} cancelled by {current_user.email}"
    )
    db.add(audit)
    db.commit()
    db.refresh(booking)

    return booking
