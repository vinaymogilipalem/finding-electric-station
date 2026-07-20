"""
models.py - All SQLAlchemy ORM models for EV ChargeHub
Each class maps to a database table. Relationships are defined using
SQLAlchemy's relationship() for easy navigation between related records.
"""

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text,
    ForeignKey, Enum as SAEnum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum


# ─────────────────────────────────────────
# ENUM DEFINITIONS
# Used as column types for fields with fixed allowed values
# ─────────────────────────────────────────

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class ChargerType(str, enum.Enum):
    AC_SLOW = "AC_SLOW"
    AC_FAST = "AC_FAST"
    DC_FAST = "DC_FAST"


class ConnectorType(str, enum.Enum):
    Type1 = "Type1"
    Type2 = "Type2"
    CCS = "CCS"
    CHAdeMO = "CHAdeMO"
    Tesla = "Tesla"


class ChargerStatus(str, enum.Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"


class NotificationType(str, enum.Enum):
    booking = "booking"
    cancellation = "cancellation"
    reminder = "reminder"
    announcement = "announcement"


# ─────────────────────────────────────────
# MODEL: User
# Stores all registered user accounts (both regular users and admins)
# ─────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)

    # Role: 'user' for regular users, 'admin' for administrators
    role = Column(SAEnum(UserRole), default=UserRole.user, nullable=False)

    is_active = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)

    # Login security: track failed attempts and lock account temporarily
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)  # NULL means not locked

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships - allow navigation from user to related records
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    history = relationship("ChargingHistory", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")


# ─────────────────────────────────────────
# MODEL: Station
# Represents an EV charging station location
# ─────────────────────────────────────────

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False, index=True)
    area = Column(String, nullable=True, index=True)

    # GPS coordinates for map display
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Operating hours stored as a simple string e.g. "6:00 AM - 10:00 PM"
    operating_hours = Column(String, nullable=True)

    # Amenities stored as comma-separated string e.g. "WiFi,Parking,Restroom"
    amenities = Column(Text, nullable=True)

    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    chargers = relationship("Charger", back_populates="station", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="station")
    history = relationship("ChargingHistory", back_populates="station")
    favorites = relationship("Favorite", back_populates="station", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="station", cascade="all, delete-orphan")


# ─────────────────────────────────────────
# MODEL: Charger
# A physical charging unit at a station
# ─────────────────────────────────────────

class Charger(Base):
    __tablename__ = "chargers"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)

    # Type and connector details
    charger_type = Column(SAEnum(ChargerType), nullable=False)
    connector_type = Column(SAEnum(ConnectorType), nullable=False)
    power_kw = Column(Float, nullable=False)  # Power output in kilowatts

    # Current operational status
    status = Column(SAEnum(ChargerStatus), default=ChargerStatus.available, nullable=False)

    # Cost per kilowatt-hour charged
    price_per_kwh = Column(Float, nullable=False, default=15.0)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    station = relationship("Station", back_populates="chargers")
    bookings = relationship("Booking", back_populates="charger")
    history = relationship("ChargingHistory", back_populates="charger")


# ─────────────────────────────────────────
# MODEL: Booking
# A reservation made by a user for a specific charger at a specific time
# ─────────────────────────────────────────

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    # Human-readable unique reference code (e.g. "BCK-A1B2C3")
    booking_ref = Column(String, unique=True, nullable=False, index=True)

    # Foreign keys linking this booking to user, station, and charger
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    charger_id = Column(Integer, ForeignKey("chargers.id"), nullable=False)

    # Booking time window
    booking_date = Column(String, nullable=False)  # Stored as "YYYY-MM-DD"
    start_time = Column(String, nullable=False)     # Stored as "HH:MM"
    end_time = Column(String, nullable=False)       # Stored as "HH:MM"

    # Status tracking
    status = Column(SAEnum(BookingStatus), default=BookingStatus.pending, nullable=False)
    payment_status = Column(SAEnum(PaymentStatus), default=PaymentStatus.pending, nullable=False)

    # Calculated based on duration and charger price_per_kwh
    total_amount = Column(Float, nullable=False, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bookings")
    station = relationship("Station", back_populates="bookings")
    charger = relationship("Charger", back_populates="bookings")
    history = relationship("ChargingHistory", back_populates="booking", uselist=False)


# ─────────────────────────────────────────
# MODEL: ChargingHistory
# A completed charging session record linked to a booking
# ─────────────────────────────────────────

class ChargingHistory(Base):
    __tablename__ = "charging_history"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    charger_id = Column(Integer, ForeignKey("chargers.id"), nullable=False)

    # Session statistics
    energy_kwh = Column(Float, nullable=False, default=0.0)       # Energy delivered in kWh
    duration_minutes = Column(Integer, nullable=False, default=0) # Total duration in minutes
    amount_paid = Column(Float, nullable=False, default=0.0)      # Total cost paid

    # Actual session start and end timestamps
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)

    # Relationships
    booking = relationship("Booking", back_populates="history")
    user = relationship("User", back_populates="history")
    station = relationship("Station", back_populates="history")
    charger = relationship("Charger", back_populates="history")


# ─────────────────────────────────────────
# MODEL: Favorite
# A user's saved/bookmarked station
# Unique constraint prevents duplicate favorites for same user+station
# ─────────────────────────────────────────

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Ensure a user can only favorite a station once
    __table_args__ = (
        UniqueConstraint("user_id", "station_id", name="uq_user_station_favorite"),
    )

    # Relationships
    user = relationship("User", back_populates="favorites")
    station = relationship("Station", back_populates="favorites")


# ─────────────────────────────────────────
# MODEL: Review
# A rating and comment left by a user for a station
# ─────────────────────────────────────────

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)

    # Integer rating from 1 (worst) to 5 (best)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reviews")
    station = relationship("Station", back_populates="reviews")


# ─────────────────────────────────────────
# MODEL: Notification
# An in-app notification message sent to a user
# ─────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)

    # Type of notification for filtering/display purposes
    type = Column(SAEnum(NotificationType), default=NotificationType.announcement, nullable=False)

    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


# ─────────────────────────────────────────
# MODEL: AuditLog
# Records important admin/system actions for security and accountability
# user_id is nullable because some actions may be system-initiated
# ─────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Who performed the action

    action = Column(String, nullable=False)      # e.g. "CREATE", "UPDATE", "DELETE", "BLOCK"
    entity = Column(String, nullable=False)      # e.g. "Station", "Booking", "User"
    entity_id = Column(Integer, nullable=True)   # The ID of the affected record
    details = Column(Text, nullable=True)        # Additional context/description
    ip_address = Column(String, nullable=True)   # Requester's IP address

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


# ─────────────────────────────────────────
# MODEL: Pricing
# Admin-managed pricing plans for different charger types
# ─────────────────────────────────────────

class Pricing(Base):
    __tablename__ = "pricing"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)             # e.g. "Standard AC Plan"
    charger_type = Column(String, nullable=False)     # References ChargerType values
    price_per_kwh = Column(Float, nullable=False)     # Cost per kWh in local currency
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
