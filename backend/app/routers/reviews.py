"""
routers/reviews.py - Reviews endpoints for EV ChargeHub
Handles station reviews creation, listing, and deletion.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.get("/station/{station_id}", response_model=List[schemas.ReviewOut])
def get_station_reviews(station_id: int, db: Session = Depends(get_db)):
    """
    Get all reviews for a specific station.
    """
    station = db.query(models.Station).filter(models.Station.id == station_id).first()
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Station not found"
        )
    return db.query(models.Review).filter(models.Review.station_id == station_id).order_by(models.Review.created_at.desc()).all()


@router.post("/station/{station_id}", response_model=schemas.ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    station_id: int,
    review_data: schemas.ReviewCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a review for a specific station.
    """
    station = db.query(models.Station).filter(models.Station.id == station_id).first()
    if not station:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Station not found"
        )

    # Check if user already reviewed this station
    existing = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.station_id == station_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this station"
        )

    review = models.Review(
        user_id=current_user.id,
        station_id=station_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@router.delete("/{id}", response_model=schemas.MessageResponse)
def delete_review(
    id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a review. Regular users can delete their own reviews; admins can delete any.
    """
    review = db.query(models.Review).filter(models.Review.id == id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    if review.user_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this review"
        )

    db.delete(review)
    db.commit()

    return {"message": "Review deleted successfully"}
