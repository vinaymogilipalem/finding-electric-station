"""
routers/pricing.py - Pricing endpoints for EV ChargeHub
Handles CRUD operations for pricing plans.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_admin_user

router = APIRouter(prefix="/api/pricing", tags=["Pricing"])


@router.get("/", response_model=List[schemas.PricingOut])
def get_all_pricing(
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all pricing plans (admin only).
    """
    return db.query(models.Pricing).all()


@router.post("/", response_model=schemas.PricingOut, status_code=status.HTTP_201_CREATED)
def create_pricing(
    pricing_data: schemas.PricingCreate,
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new pricing plan (admin only).
    """
    pricing = models.Pricing(
        name=pricing_data.name,
        charger_type=pricing_data.charger_type,
        price_per_kwh=pricing_data.price_per_kwh,
        description=pricing_data.description,
        is_active=pricing_data.is_active
    )
    db.add(pricing)
    db.commit()
    db.refresh(pricing)
    return pricing


@router.put("/{id}", response_model=schemas.PricingOut)
def update_pricing(
    id: int,
    pricing_data: schemas.PricingUpdate,
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update a pricing plan (admin only).
    """
    pricing = db.query(models.Pricing).filter(models.Pricing.id == id).first()
    if not pricing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing plan not found"
        )

    # Update only fields that are provided
    for key, value in pricing_data.model_dump(exclude_unset=True).items():
        setattr(pricing, key, value)

    db.commit()
    db.refresh(pricing)
    return pricing


@router.delete("/{id}", response_model=schemas.MessageResponse)
def delete_pricing(
    id: int,
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a pricing plan (admin only).
    """
    pricing = db.query(models.Pricing).filter(models.Pricing.id == id).first()
    if not pricing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing plan not found"
        )

    db.delete(pricing)
    db.commit()
    return {"message": "Pricing plan deleted successfully"}
