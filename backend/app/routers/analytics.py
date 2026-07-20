"""
routers/analytics.py - Admin Analytics endpoints for EV ChargeHub
Generates statistics, summaries, and trend data for the admin dashboard.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_admin_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get high-level summary statistics for the admin dashboard.
    """
    total_users = db.query(models.User).count()
    total_stations = db.query(models.Station).count()
    total_bookings = db.query(models.Booking).count()

    # Sum of amount_paid in history (total actual revenue)
    total_revenue_query = db.query(func.sum(models.ChargingHistory.amount_paid)).scalar()
    total_revenue = float(total_revenue_query) if total_revenue_query else 0.0

    # Count of chargers by status
    available_chargers = db.query(models.Charger).filter(models.Charger.status == models.ChargerStatus.available).count()
    occupied_chargers = db.query(models.Charger).filter(models.Charger.status == models.ChargerStatus.occupied).count()

    # Bookings made today
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    bookings_today = db.query(models.Booking).filter(models.Booking.booking_date == today_str).count()

    return {
        "total_users": total_users,
        "total_stations": total_stations,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "available_chargers": available_chargers,
        "occupied_chargers": occupied_chargers,
        "bookings_today": bookings_today
    }


@router.get("/revenue", response_model=List[schemas.RevenuePoint])
def get_revenue_analytics(
    period: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get revenue analytics points (date vs amount) for rendering charts.
    """
    # Using charging history start times for dates
    history = db.query(models.ChargingHistory).filter(models.ChargingHistory.started_at != None).all()
    
    # Simple Python-based aggregation to avoid SQLite date function formatting complexities
    data = {}
    
    for h in history:
        date_obj = h.started_at
        if period == "daily":
            key = date_obj.strftime("%Y-%m-%d")
        elif period == "weekly":
            # Start of the week (Monday)
            start_of_week = date_obj - timedelta(days=date_obj.weekday())
            key = start_of_week.strftime("%Y-%m-%d")
        else: # monthly
            key = date_obj.strftime("%Y-%m")
            
        data[key] = data.get(key, 0.0) + h.amount_paid
        
    sorted_keys = sorted(data.keys())
    # Return last 30 entries maximum to avoid overloading
    if len(sorted_keys) > 30:
        sorted_keys = sorted_keys[-30:]
        
    return [{"date": k, "amount": data[k]} for k in sorted_keys]


@router.get("/bookings-trend", response_model=List[schemas.BookingTrendPoint])
def get_bookings_trend(
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get bookings count trend per day for the last 30 days.
    """
    # Group by booking_date
    results = db.query(
        models.Booking.booking_date,
        func.count(models.Booking.id)
    ).group_by(models.Booking.booking_date).all()
    
    # Fill in dates for the last 30 days if they are missing
    data = {r[0]: r[1] for r in results if r[0]}
    
    today = datetime.utcnow()
    points = []
    
    for i in range(29, -1, -1):
        date_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        points.append({
            "date": date_str,
            "count": data.get(date_str, 0)
        })
        
    return points


@router.get("/popular-stations", response_model=List[schemas.PopularStation])
def get_popular_stations(
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get top 5 stations by booking count.
    """
    results = db.query(
        models.Booking.station_id,
        models.Station.name,
        func.count(models.Booking.id).label("count")
    ).join(models.Station, models.Station.id == models.Booking.station_id)\
     .group_by(models.Booking.station_id)\
     .order_by(func.count(models.Booking.id).desc())\
     .limit(5).all()

    return [
        {
            "station_id": r[0],
            "station_name": r[1],
            "booking_count": r[2]
        }
        for r in results
    ]


@router.get("/charger-types", response_model=List[schemas.ChargerTypeStats])
def get_charger_type_stats(
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get booking distribution by charger type.
    """
    results = db.query(
        models.Charger.charger_type,
        func.count(models.Booking.id)
    ).join(models.Booking, models.Booking.charger_id == models.Charger.id)\
     .group_by(models.Charger.charger_type).all()

    return [
        {
            "charger_type": r[0].value if hasattr(r[0], 'value') else str(r[0]),
            "count": r[1]
        }
        for r in results
    ]


@router.get("/user-growth", response_model=List[schemas.UserGrowthPoint])
def get_user_growth(
    admin: models.User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get daily registration counts for the last 30 days.
    """
    users = db.query(models.User).filter(models.User.created_at != None).all()
    
    data = {}
    for u in users:
        date_str = u.created_at.strftime("%Y-%m-%d")
        data[date_str] = data.get(date_str, 0) + 1
        
    today = datetime.utcnow()
    points = []
    
    for i in range(29, -1, -1):
        date_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        points.append({
            "date": date_str,
            "count": data.get(date_str, 0)
        })
        
    return points
