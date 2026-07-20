"""
schemas.py - Pydantic schemas for request/response validation
Pydantic models are used for:
  - Validating incoming request data (request bodies)
  - Serializing outgoing response data
  - Providing automatic documentation in Swagger UI

Naming convention:
  - Base: shared fields
  - Create: fields for POST (creation) requests
  - Update: fields for PUT (update) requests
  - Out / Response: fields returned in responses
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─────────────────────────────────────────
# ENUM SCHEMAS
# Mirror the model enums for Pydantic validation
# ─────────────────────────────────────────

class UserRoleEnum(str, Enum):
    user = "user"
    admin = "admin"


class ChargerTypeEnum(str, Enum):
    AC_SLOW = "AC_SLOW"
    AC_FAST = "AC_FAST"
    DC_FAST = "DC_FAST"


class ConnectorTypeEnum(str, Enum):
    Type1 = "Type1"
    Type2 = "Type2"
    CCS = "CCS"
    CHAdeMO = "CHAdeMO"
    Tesla = "Tesla"


class ChargerStatusEnum(str, Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"


class BookingStatusEnum(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class PaymentStatusEnum(str, Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"


class NotificationTypeEnum(str, Enum):
    booking = "booking"
    cancellation = "cancellation"
    reminder = "reminder"
    announcement = "announcement"


# ─────────────────────────────────────────
# USER SCHEMAS
# ─────────────────────────────────────────

class UserBase(BaseModel):
    """Common fields shared across user schemas"""
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user account (registration)"""
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")


class UserUpdate(BaseModel):
    """Schema for updating own profile (all fields optional)"""
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserPasswordChange(BaseModel):
    """Schema for changing own password"""
    current_password: str
    new_password: str = Field(..., min_length=6)


class UserOut(UserBase):
    """Schema for returning user data in responses (no password)"""
    id: int
    role: UserRoleEnum
    is_active: bool
    is_blocked: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────────────────

class LoginRequest(BaseModel):
    """Schema for login request body"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response after successful login/register"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class AccessTokenResponse(BaseModel):
    """Schema for refreshed access token"""
    access_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh request"""
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema for password reset"""
    token: str
    new_password: str = Field(..., min_length=6)


# ─────────────────────────────────────────
# STATION SCHEMAS
# ─────────────────────────────────────────

class StationBase(BaseModel):
    """Common fields for station creation and update"""
    name: str
    description: Optional[str] = None
    address: str
    city: str
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[str] = None
    amenities: Optional[str] = None  # Comma-separated string
    image_url: Optional[str] = None
    is_active: bool = True


class StationCreate(StationBase):
    """Schema for creating a new station"""
    pass


class StationUpdate(BaseModel):
    """Schema for updating station details (all fields optional)"""
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[str] = None
    amenities: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ChargerOut(BaseModel):
    """Nested charger info used within station responses"""
    id: int
    charger_type: ChargerTypeEnum
    connector_type: ConnectorTypeEnum
    power_kw: float
    status: ChargerStatusEnum
    price_per_kwh: float
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewOut(BaseModel):
    """Nested review info used within station responses"""
    id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    user: Optional["UserOut"] = None

    model_config = {"from_attributes": True}


class StationOut(StationBase):
    """Full station data returned in responses"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    chargers: List[ChargerOut] = []
    reviews: List[ReviewOut] = []

    model_config = {"from_attributes": True}


class StationListOut(StationBase):
    """Lightweight station data for list views (no nested chargers/reviews)"""
    id: int
    created_at: datetime
    avg_rating: Optional[float] = None
    charger_count: Optional[int] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# CHARGER SCHEMAS
# ─────────────────────────────────────────

class ChargerCreate(BaseModel):
    """Schema for creating a new charger"""
    station_id: int
    charger_type: ChargerTypeEnum
    connector_type: ConnectorTypeEnum
    power_kw: float = Field(..., gt=0)
    status: ChargerStatusEnum = ChargerStatusEnum.available
    price_per_kwh: float = Field(..., gt=0)


class ChargerUpdate(BaseModel):
    """Schema for updating charger details (all optional)"""
    charger_type: Optional[ChargerTypeEnum] = None
    connector_type: Optional[ConnectorTypeEnum] = None
    power_kw: Optional[float] = None
    status: Optional[ChargerStatusEnum] = None
    price_per_kwh: Optional[float] = None


class ChargerStatusUpdate(BaseModel):
    """Schema for updating only the charger status"""
    status: ChargerStatusEnum


# ─────────────────────────────────────────
# BOOKING SCHEMAS
# ─────────────────────────────────────────

class BookingCreate(BaseModel):
    """Schema for creating a new booking"""
    station_id: int
    charger_id: int
    booking_date: str = Field(..., description="Date in YYYY-MM-DD format")
    start_time: str = Field(..., description="Start time in HH:MM format")
    end_time: str = Field(..., description="End time in HH:MM format")


class BookingOut(BaseModel):
    """Full booking data returned in responses"""
    id: int
    booking_ref: str
    user_id: int
    station_id: int
    charger_id: int
    booking_date: str
    start_time: str
    end_time: str
    status: BookingStatusEnum
    payment_status: PaymentStatusEnum
    total_amount: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[UserOut] = None
    station: Optional[StationListOut] = None
    charger: Optional[ChargerOut] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# CHARGING HISTORY SCHEMAS
# ─────────────────────────────────────────

class HistoryOut(BaseModel):
    """Charging history session data"""
    id: int
    booking_id: int
    user_id: int
    station_id: int
    charger_id: int
    energy_kwh: float
    duration_minutes: int
    amount_paid: float
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    station: Optional[StationListOut] = None
    charger: Optional[ChargerOut] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# FAVORITE SCHEMAS
# ─────────────────────────────────────────

class FavoriteOut(BaseModel):
    """Favorite record with station details"""
    id: int
    user_id: int
    station_id: int
    created_at: datetime
    station: Optional[StationListOut] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# REVIEW SCHEMAS
# ─────────────────────────────────────────

class ReviewCreate(BaseModel):
    """Schema for submitting a new review"""
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = None


# ─────────────────────────────────────────
# NOTIFICATION SCHEMAS
# ─────────────────────────────────────────

class NotificationOut(BaseModel):
    """Notification data"""
    id: int
    user_id: int
    title: str
    message: str
    type: NotificationTypeEnum
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# PRICING SCHEMAS
# ─────────────────────────────────────────

class PricingCreate(BaseModel):
    """Schema for creating a pricing plan"""
    name: str
    charger_type: str
    price_per_kwh: float = Field(..., gt=0)
    description: Optional[str] = None
    is_active: bool = True


class PricingUpdate(BaseModel):
    """Schema for updating a pricing plan (all optional)"""
    name: Optional[str] = None
    charger_type: Optional[str] = None
    price_per_kwh: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class PricingOut(BaseModel):
    """Pricing plan data"""
    id: int
    name: str
    charger_type: str
    price_per_kwh: float
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# AUDIT LOG SCHEMAS
# ─────────────────────────────────────────

class AuditLogOut(BaseModel):
    """Audit log entry data"""
    id: int
    user_id: Optional[int] = None
    action: str
    entity: str
    entity_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# ANALYTICS SCHEMAS
# ─────────────────────────────────────────

class AnalyticsSummary(BaseModel):
    """Dashboard summary statistics"""
    total_users: int
    total_stations: int
    total_bookings: int
    total_revenue: float
    available_chargers: int
    occupied_chargers: int
    bookings_today: int


class RevenuePoint(BaseModel):
    """A single data point for revenue over time charts"""
    date: str
    amount: float


class BookingTrendPoint(BaseModel):
    """A single data point for booking trends over time"""
    date: str
    count: int


class PopularStation(BaseModel):
    """A station entry in the popular stations ranking"""
    station_id: int
    station_name: str
    booking_count: int


class ChargerTypeStats(BaseModel):
    """Booking statistics broken down by charger type"""
    charger_type: str
    count: int


class UserGrowthPoint(BaseModel):
    """A single data point for new user registrations per day"""
    date: str
    count: int


# ─────────────────────────────────────────
# GENERIC RESPONSE SCHEMAS
# ─────────────────────────────────────────

class MessageResponse(BaseModel):
    """Simple message response for endpoints that just confirm an action"""
    message: str


class PaginatedResponse(BaseModel):
    """Generic paginated response wrapper"""
    total: int
    skip: int
    limit: int
    items: list
