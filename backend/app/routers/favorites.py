"""
routers/favorites.py - User favorites management endpoints
Allows users to save/bookmark charging stations they frequently use.
The unique constraint on (user_id, station_id) prevents duplicate favorites.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])


@router.get("/", response_model=List[schemas.FavoriteOut])
def list_favorites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    List all stations favorited by the currently logged-in user.
    Returns favorites with full station details included.
    """
    favorites = (
        db.query(models.Favorite)
        .options(joinedload(models.Favorite.station))
        .filter(models.Favorite.user_id == current_user.id)
        .order_by(models.Favorite.created_at.desc())
        .all()
    )
    return favorites


@router.post("/{station_id}", response_model=schemas.FavoriteOut, status_code=status.HTTP_201_CREATED)
def add_favorite(
    station_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Add a station to the user's favorites.
    Returns 409 Conflict if the station is already in the user's favorites.
    Returns 404 if the station doesn't exist.
    """
    # Verify the station exists
    station = db.query(models.Station).filter(models.Station.id == station_id).first()
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station with ID {station_id} not found."
        )

    # Check for existing favorite to provide a clear error message
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.station_id == station_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This station is already in your favorites."
        )

    # Create the favorite record
    favorite = models.Favorite(
        user_id=current_user.id,
        station_id=station_id
    )

    try:
        db.add(favorite)
        db.commit()
        db.refresh(favorite)
    except IntegrityError:
        # Handle race condition where duplicate was inserted concurrently
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This station is already in your favorites."
        )

    # Reload with station details for the response
    favorite = (
        db.query(models.Favorite)
        .options(joinedload(models.Favorite.station))
        .filter(models.Favorite.id == favorite.id)
        .first()
    )

    return favorite


@router.delete("/{station_id}", response_model=schemas.MessageResponse)
def remove_favorite(
    station_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Remove a station from the user's favorites.
    Returns 404 if the station is not in the user's favorites.
    """
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.station_id == station_id
    ).first()

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Station not found in your favorites."
        )

    db.delete(favorite)
    db.commit()

    return {"message": f"Station removed from favorites."}
