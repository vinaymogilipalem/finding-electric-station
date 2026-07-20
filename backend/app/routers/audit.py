"""
routers/audit.py - Audit logs endpoints for EV ChargeHub
Allows admins to view system audit logs.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_admin_user

router = APIRouter(prefix="/api/audit", tags=["Audit Logs"])


@router.get("/", response_model=schemas.PaginatedResponse)
def get_audit_logs(
    action: Optional[str] = None,
    entity: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get audit logs (admin only, paginated).
    Allows filtering by action type (e.g. CREATE, UPDATE, DELETE) and entity name.
    """
    query = db.query(models.AuditLog)

    if action:
        query = query.filter(models.AuditLog.action == action)
    if entity:
        query = query.filter(models.AuditLog.entity == entity)

    total = query.count()
    items = query.order_by(models.AuditLog.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items
    }
