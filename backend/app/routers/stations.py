"""
routers/stations.py - Charging station CRUD endpoints
Public endpoints for listing/viewing stations,
admin-protected endpoints for creating/updating/deleting stations.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, get_admin_user

router = APIRouter(prefix="/api/stations", tags=["Stations"])


@router.get("/", response_model=List[schemas.StationOut])
def list_stations(
    q: Optional[str] = Query(None, description="Search by station name"),
    city: Optional[str] = Query(None, description="Filter by city"),
    area: Optional[str] = Query(None, description="Filter by area"),
    charger_type: Optional[str] = Query(None, description="Filter by charger type (AC_SLOW, AC_FAST, DC_FAST)"),
    status: Optional[str] = Query(None, description="Filter stations that have chargers with this status"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    List all active charging stations with optional search/filter.
    Publicly accessible (no authentication required).
    
    Filters:
    - q: Search by station name (case-insensitive partial match)
    - city: Filter by exact city name
    - area: Filter by area within city
    - charger_type: Only show stations with this charger type
    - status: Only show stations with chargers in this status (available/occupied/maintenance)
    """
    # Start with base query for active stations
    query = db.query(models.Station).filter(models.Station.is_active == True)

    # Apply search filter on station name
    if q:
        query = query.filter(models.Station.name.ilike(f"%{q}%"))

    # Apply city filter
    if city:
        query = query.filter(models.Station.city.ilike(f"%{city}%"))

    # Apply area filter
    if area:
        query = query.filter(models.Station.area.ilike(f"%{area}%"))

    # Filter by charger type - join to chargers table
    if charger_type:
        query = query.join(models.Charger).filter(
            models.Charger.charger_type == charger_type
        ).distinct()

    # Filter by charger status - join to chargers table
    if status:
        query = query.join(models.Charger, isouter=True).filter(
            models.Charger.status == status
        ).distinct()

    # Apply pagination and eagerly load relationships
    stations = (
        query
        .options(joinedload(models.Station.chargers), joinedload(models.Station.reviews))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return stations


@router.get("/{station_id}", response_model=schemas.StationOut)
def get_station(station_id: int, db: Session = Depends(get_db)):
    """
    Get full details for a single station including its chargers and reviews.
    Publicly accessible.
    """
    station = (
        db.query(models.Station)
        .options(
            joinedload(models.Station.chargers),
            joinedload(models.Station.reviews).joinedload(models.Review.user)
        )
        .filter(models.Station.id == station_id)
        .first()
    )

    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station with ID {station_id} not found."
        )

    return station


@router.post("/", response_model=schemas.StationOut, status_code=status.HTTP_201_CREATED)
def create_station(
    station_data: schemas.StationCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] Create a new charging station.
    Requires admin authentication.
    """
    new_station = models.Station(**station_data.model_dump())
    db.add(new_station)
    db.commit()
    db.refresh(new_station)

    # Log the creation action in audit logs
    audit = models.AuditLog(
        user_id=admin.id,
        action="CREATE",
        entity="Station",
        entity_id=new_station.id,
        details=f"Admin created station: {new_station.name} in {new_station.city}"
    )
    db.add(audit)
    db.commit()

    return new_station


@router.put("/{station_id}", response_model=schemas.StationOut)
def update_station(
    station_id: int,
    update_data: schemas.StationUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] Update an existing station's details.
    Only provided fields are updated (partial update).
    """
    station = db.query(models.Station).filter(models.Station.id == station_id).first()
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station with ID {station_id} not found."
        )

    # Apply only the non-None fields from update_data
    update_fields = update_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(station, field, value)

    from datetime import datetime
    station.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(station)

    # Log the update action
    audit = models.AuditLog(
        user_id=admin.id,
        action="UPDATE",
        entity="Station",
        entity_id=station.id,
        details=f"Admin updated station: {station.name}. Fields changed: {list(update_fields.keys())}"
    )
    db.add(audit)
    db.commit()

    return station


@router.delete("/{station_id}", response_model=schemas.MessageResponse)
def delete_station(
    station_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    """
    [ADMIN] Delete a charging station and all its associated chargers.
    This action is irreversible.
    """
    station = db.query(models.Station).filter(models.Station.id == station_id).first()
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station with ID {station_id} not found."
        )

    station_name = station.name

    # Log before deleting (since delete cascades)
    audit = models.AuditLog(
        user_id=admin.id,
        action="DELETE",
        entity="Station",
        entity_id=station_id,
        details=f"Admin deleted station: {station_name}"
    )
    db.add(audit)

    db.delete(station)
    db.commit()

    return {"message": f"Station '{station_name}' has been deleted."}
