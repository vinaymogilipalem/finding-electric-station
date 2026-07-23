"""
seed.py - Database seeding script for EV ChargeHub
Creates initial test data including admin user, regular users, stations,
chargers, bookings, history, notifications, pricing plans, and reviews.

The seed only runs if the database is empty (user count == 0),
so it is safe to call on every startup.
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from . import models
from .auth import get_password_hash
import uuid


def generate_booking_ref() -> str:
    """Generate a short, unique booking reference code like 'BCK-A1B2C3'"""
    return "BCK-" + str(uuid.uuid4()).upper()[:6]


def seed_database(db: Session):
    """
    Populate the database with initial seed data.
    This function is safe to call multiple times - it checks if data
    already exists and skips seeding if users are present.
    
    Args:
        db: SQLAlchemy database session
    """

    # ── Guard: Only seed if database is empty ──
    existing_users = db.query(models.User).count()
    if existing_users > 0:
        print("Database already seeded. Skipping seed.")
        return

    print("Seeding database with initial data...")

    # ─────────────────────────────────────────
    # USERS
    # Create 1 admin + 3 regular users loaded from environment variables
    # ─────────────────────────────────────────
    import os
    from dotenv import load_dotenv

    # Load env variables from backend/.env
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(BASE_DIR, ".env")
    load_dotenv(dotenv_path=env_path)

    # Get credentials from env, using the previous values as secure fallbacks
    admin_email = os.getenv("ADMIN_EMAIL", "admin@evchargehub.com")
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin@123")

    john_email = os.getenv("USER_JOHN_EMAIL", "john@example.com")
    john_username = os.getenv("USER_JOHN_USERNAME", "john_doe")
    john_password = os.getenv("USER_JOHN_PASSWORD", "User@123")

    sarah_email = os.getenv("USER_SARAH_EMAIL", "sarah@example.com")
    sarah_username = os.getenv("USER_SARAH_USERNAME", "sarah_smith")
    sarah_password = os.getenv("USER_SARAH_PASSWORD", "User@123")

    mike_email = os.getenv("USER_MIKE_EMAIL", "mike@example.com")
    mike_username = os.getenv("USER_MIKE_USERNAME", "mike_jones")
    mike_password = os.getenv("USER_MIKE_PASSWORD", "User@123")

    admin = models.User(
        email=admin_email,
        username=admin_username,
        full_name="System Administrator",
        phone="9999999999",
        password_hash=get_password_hash(admin_password),
        role=models.UserRole.admin,
        is_active=True,
        is_blocked=False,
    )

    john = models.User(
        email=john_email,
        username=john_username,
        full_name="John Doe",
        phone="9876543210",
        password_hash=get_password_hash(john_password),
        role=models.UserRole.user,
        is_active=True,
        is_blocked=False,
    )

    sarah = models.User(
        email=sarah_email,
        username=sarah_username,
        full_name="Sarah Smith",
        phone="9876543211",
        password_hash=get_password_hash(sarah_password),
        role=models.UserRole.user,
        is_active=True,
        is_blocked=False,
    )

    mike = models.User(
        email=mike_email,
        username=mike_username,
        full_name="Mike Jones",
        phone="9876543212",
        password_hash=get_password_hash(mike_password),
        role=models.UserRole.user,
        is_active=True,
        is_blocked=False,
    )

    db.add_all([admin, john, sarah, mike])
    db.commit()
    db.refresh(admin)
    db.refresh(john)
    db.refresh(sarah)
    db.refresh(mike)

    # ─────────────────────────────────────────
    # STATIONS
    # 5 EV charging stations across Bangalore
    # ─────────────────────────────────────────

    station1 = models.Station(
        name="GreenCharge Koramangala",
        description="Premium EV charging hub in the heart of Koramangala with fast DC chargers and comfortable waiting lounge.",
        address="80 Feet Road, 6th Block, Koramangala",
        city="Bangalore",
        area="Koramangala",
        latitude=12.9352,
        longitude=77.6245,
        operating_hours="6:00 AM - 11:00 PM",
        amenities="WiFi,Parking,Restroom,Cafe,CCTV",
        image_url="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
        is_active=True,
    )

    station2 = models.Station(
        name="PowerUp HSR Layout",
        description="Modern charging station in HSR Layout with multiple AC and DC chargers. Perfect for overnight charging.",
        address="Sector 2, HSR Layout",
        city="Bangalore",
        area="HSR Layout",
        latitude=12.9082,
        longitude=77.6476,
        operating_hours="24 Hours",
        amenities="WiFi,Parking,Restroom,Security",
        image_url="https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=800",
        is_active=True,
    )

    station3 = models.Station(
        name="EV Hub Indiranagar",
        description="Centrally located charging station near Indiranagar 100 Feet Road with quick charging options.",
        address="100 Feet Road, Indiranagar",
        city="Bangalore",
        area="Indiranagar",
        latitude=12.9784,
        longitude=77.6408,
        operating_hours="7:00 AM - 10:00 PM",
        amenities="WiFi,Parking,Cafe,Waiting Area",
        image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        is_active=True,
    )

    station4 = models.Station(
        name="ChargePoint Whitefield",
        description="Large capacity charging facility in Whitefield IT corridor. Serves the tech park community.",
        address="ITPL Main Road, Whitefield",
        city="Bangalore",
        area="Whitefield",
        latitude=12.9698,
        longitude=77.7500,
        operating_hours="6:00 AM - 11:00 PM",
        amenities="WiFi,Parking,Restroom,Cafeteria,EV Service",
        image_url="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
        is_active=True,
    )

    station5 = models.Station(
        name="QuickCharge MG Road",
        description="Ultra-fast charging station near MG Road metro. Ideal for shoppers and commuters.",
        address="Brigade Road Junction, MG Road",
        city="Bangalore",
        area="MG Road",
        latitude=12.9756,
        longitude=77.6097,
        operating_hours="8:00 AM - 10:00 PM",
        amenities="WiFi,Valet Parking,Restroom,Shopping Nearby",
        image_url="https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=800",
        is_active=True,
    )

    station6 = models.Station(
        name="Jubilee Hills EV Hub",
        description="Premium EV charging facility located in the high-end residential and commercial hub of Jubilee Hills. Equipped with high-power DC chargers.",
        address="Road No. 36, Jubilee Hills",
        city="Hyderabad",
        area="Jubilee Hills",
        latitude=17.4312,
        longitude=78.4008,
        operating_hours="24 Hours",
        amenities="WiFi,Parking,Restroom,Cafe,Shopping Nearby",
        image_url="https://images.unsplash.com/photo-1563720223185-11003d516935?w=800",
        is_active=True,
    )

    station7 = models.Station(
        name="Kompally Express Charge",
        description="Convenient highway charging station in Kompally. Perfect for long-distance commuters and local residents.",
        address="NH 44, Kompally",
        city="Hyderabad",
        area="Kompally",
        latitude=17.5348,
        longitude=78.4855,
        operating_hours="6:00 AM - 11:00 PM",
        amenities="Parking,Restroom,Food Court,Security",
        image_url="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
        is_active=True,
    )

    station8 = models.Station(
        name="Madhapur Tech Charge",
        description="High-tech charging station located in the heart of Hyderabad's IT corridor (Madhapur). Great density of fast and slow chargers.",
        address="Hitec City Road, Madhapur",
        city="Hyderabad",
        area="Madhapur",
        latitude=17.4483,
        longitude=78.3741,
        operating_hours="24 Hours",
        amenities="WiFi,Parking,Waiting Lounge,Beverages,CCTV",
        image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        is_active=True,
    )

    station9 = models.Station(
        name="Gachibowli Power Station",
        description="Ultra-fast DC charging station near the financial district. Offers compatibility with all major EV brands including Tesla connector types.",
        address="ISB Road, Gachibowli",
        city="Hyderabad",
        area="Gachibowli",
        latitude=17.4401,
        longitude=78.3489,
        operating_hours="7:00 AM - 11:00 PM",
        amenities="WiFi,Valet Parking,Restroom,Cafe",
        image_url="https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=800",
        is_active=True,
    )

    station10 = models.Station(
        name="Secunderabad Club EV Station",
        description="Centrally located charging hub serving the Secunderabad area with multiple AC and DC points.",
        address="Picket Road, Secunderabad",
        city="Hyderabad",
        area="Secunderabad",
        latitude=17.4534,
        longitude=78.5023,
        operating_hours="6:00 AM - 10:00 PM",
        amenities="Parking,Restroom,Security",
        image_url="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
        is_active=True,
    )

    db.add_all([station1, station2, station3, station4, station5, station6, station7, station8, station9, station10])
    db.commit()
    for s in [station1, station2, station3, station4, station5, station6, station7, station8, station9, station10]:
        db.refresh(s)

    # ─────────────────────────────────────────
    # CHARGERS
    # 3-4 chargers per station with mixed types
    # ─────────────────────────────────────────

    chargers_data = [
        # Station 1 - GreenCharge Koramangala
        models.Charger(station_id=station1.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CCS, power_kw=50.0,
                       status=models.ChargerStatus.available, price_per_kwh=18.0),
        models.Charger(station_id=station1.id, charger_type=models.ChargerType.AC_FAST,
                       connector_type=models.ConnectorType.Type2, power_kw=22.0,
                       status=models.ChargerStatus.occupied, price_per_kwh=12.0),
        models.Charger(station_id=station1.id, charger_type=models.ChargerType.AC_SLOW,
                       connector_type=models.ConnectorType.Type1, power_kw=7.4,
                       status=models.ChargerStatus.available, price_per_kwh=8.0),

        # Station 2 - PowerUp HSR Layout
        models.Charger(station_id=station2.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CHAdeMO, power_kw=62.5,
                       status=models.ChargerStatus.available, price_per_kwh=20.0),
        models.Charger(station_id=station2.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CCS, power_kw=50.0,
                       status=models.ChargerStatus.maintenance, price_per_kwh=18.0),
        models.Charger(station_id=station2.id, charger_type=models.ChargerType.AC_FAST,
                       connector_type=models.ConnectorType.Type2, power_kw=22.0,
                       status=models.ChargerStatus.available, price_per_kwh=12.0),
        models.Charger(station_id=station2.id, charger_type=models.ChargerType.AC_SLOW,
                       connector_type=models.ConnectorType.Type2, power_kw=11.0,
                       status=models.ChargerStatus.available, price_per_kwh=9.0),

        # Station 3 - EV Hub Indiranagar
        models.Charger(station_id=station3.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CCS, power_kw=100.0,
                       status=models.ChargerStatus.available, price_per_kwh=22.0),
        models.Charger(station_id=station3.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.Tesla, power_kw=150.0,
                       status=models.ChargerStatus.available, price_per_kwh=25.0),
        models.Charger(station_id=station3.id, charger_type=models.ChargerType.AC_FAST,
                       connector_type=models.ConnectorType.Type2, power_kw=22.0,
                       status=models.ChargerStatus.occupied, price_per_kwh=12.0),

        # Station 4 - ChargePoint Whitefield
        models.Charger(station_id=station4.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CCS, power_kw=50.0,
                       status=models.ChargerStatus.available, price_per_kwh=18.0),
        models.Charger(station_id=station4.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CHAdeMO, power_kw=50.0,
                       status=models.ChargerStatus.available, price_per_kwh=18.0),
        models.Charger(station_id=station4.id, charger_type=models.ChargerType.AC_FAST,
                       connector_type=models.ConnectorType.Type2, power_kw=22.0,
                       status=models.ChargerStatus.available, price_per_kwh=12.0),
        models.Charger(station_id=station4.id, charger_type=models.ChargerType.AC_SLOW,
                       connector_type=models.ConnectorType.Type1, power_kw=7.4,
                       status=models.ChargerStatus.maintenance, price_per_kwh=8.0),

        # Station 5 - QuickCharge MG Road
        models.Charger(station_id=station5.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CCS, power_kw=150.0,
                       status=models.ChargerStatus.available, price_per_kwh=25.0),
        models.Charger(station_id=station5.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.Tesla, power_kw=250.0,
                       status=models.ChargerStatus.occupied, price_per_kwh=30.0),
        models.Charger(station_id=station5.id, charger_type=models.ChargerType.AC_FAST,
                       connector_type=models.ConnectorType.Type2, power_kw=22.0,
                       status=models.ChargerStatus.available, price_per_kwh=12.0),

        # Station 6 - Jubilee Hills EV Hub
        models.Charger(station_id=station6.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CCS, power_kw=60.0,
                       status=models.ChargerStatus.available, price_per_kwh=19.0),
        models.Charger(station_id=station6.id, charger_type=models.ChargerType.AC_FAST,
                       connector_type=models.ConnectorType.Type2, power_kw=22.0,
                       status=models.ChargerStatus.available, price_per_kwh=12.0),

        # Station 7 - Kompally Express Charge
        models.Charger(station_id=station7.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CCS, power_kw=50.0,
                       status=models.ChargerStatus.available, price_per_kwh=18.0),
        models.Charger(station_id=station7.id, charger_type=models.ChargerType.AC_SLOW,
                       connector_type=models.ConnectorType.Type1, power_kw=7.4,
                       status=models.ChargerStatus.available, price_per_kwh=8.0),

        # Station 8 - Madhapur Tech Charge
        models.Charger(station_id=station8.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CCS, power_kw=120.0,
                       status=models.ChargerStatus.available, price_per_kwh=23.0),
        models.Charger(station_id=station8.id, charger_type=models.ChargerType.AC_FAST,
                       connector_type=models.ConnectorType.Type2, power_kw=22.0,
                       status=models.ChargerStatus.occupied, price_per_kwh=12.0),
        models.Charger(station_id=station8.id, charger_type=models.ChargerType.AC_SLOW,
                       connector_type=models.ConnectorType.Type2, power_kw=11.0,
                       status=models.ChargerStatus.available, price_per_kwh=9.0),

        # Station 9 - Gachibowli Power Station
        models.Charger(station_id=station9.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.CCS, power_kw=150.0,
                       status=models.ChargerStatus.available, price_per_kwh=25.0),
        models.Charger(station_id=station9.id, charger_type=models.ChargerType.DC_FAST,
                       connector_type=models.ConnectorType.Tesla, power_kw=250.0,
                       status=models.ChargerStatus.available, price_per_kwh=28.0),

        # Station 10 - Secunderabad Club EV Station
        models.Charger(station_id=station10.id, charger_type=models.ChargerType.AC_FAST,
                       connector_type=models.ConnectorType.Type2, power_kw=22.0,
                       status=models.ChargerStatus.available, price_per_kwh=12.0),
        models.Charger(station_id=station10.id, charger_type=models.ChargerType.AC_SLOW,
                       connector_type=models.ConnectorType.Type2, power_kw=11.0,
                       status=models.ChargerStatus.available, price_per_kwh=9.0),
    ]

    db.add_all(chargers_data)
    db.commit()
    for c in chargers_data:
        db.refresh(c)

    # Reference specific chargers for bookings
    c1_st1 = chargers_data[0]   # DC_FAST at station1
    c2_st1 = chargers_data[1]   # AC_FAST at station1
    c1_st2 = chargers_data[3]   # DC_FAST at station2
    c1_st3 = chargers_data[7]   # DC_FAST at station3
    c1_st4 = chargers_data[10]  # DC_FAST at station4
    c1_st5 = chargers_data[14]  # DC_FAST at station5

    # ─────────────────────────────────────────
    # BOOKINGS
    # 10+ bookings with varied statuses
    # ─────────────────────────────────────────

    now = datetime.utcnow()
    today = now.strftime("%Y-%m-%d")
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    two_days_ago = (now - timedelta(days=2)).strftime("%Y-%m-%d")
    tomorrow = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    next_week = (now + timedelta(days=7)).strftime("%Y-%m-%d")

    bookings = [
        # John's bookings
        models.Booking(booking_ref=generate_booking_ref(), user_id=john.id,
                       station_id=station1.id, charger_id=c1_st1.id,
                       booking_date=today, start_time="09:00", end_time="11:00",
                       status=models.BookingStatus.confirmed,
                       payment_status=models.PaymentStatus.paid, total_amount=360.0),

        models.Booking(booking_ref=generate_booking_ref(), user_id=john.id,
                       station_id=station2.id, charger_id=c1_st2.id,
                       booking_date=yesterday, start_time="14:00", end_time="16:00",
                       status=models.BookingStatus.completed,
                       payment_status=models.PaymentStatus.paid, total_amount=400.0),

        models.Booking(booking_ref=generate_booking_ref(), user_id=john.id,
                       station_id=station3.id, charger_id=c1_st3.id,
                       booking_date=tomorrow, start_time="10:00", end_time="12:00",
                       status=models.BookingStatus.pending,
                       payment_status=models.PaymentStatus.pending, total_amount=440.0),

        models.Booking(booking_ref=generate_booking_ref(), user_id=john.id,
                       station_id=station1.id, charger_id=c2_st1.id,
                       booking_date=two_days_ago, start_time="08:00", end_time="10:00",
                       status=models.BookingStatus.cancelled,
                       payment_status=models.PaymentStatus.refunded, total_amount=240.0),

        # Sarah's bookings
        models.Booking(booking_ref=generate_booking_ref(), user_id=sarah.id,
                       station_id=station4.id, charger_id=c1_st4.id,
                       booking_date=today, start_time="13:00", end_time="15:00",
                       status=models.BookingStatus.confirmed,
                       payment_status=models.PaymentStatus.paid, total_amount=360.0),

        models.Booking(booking_ref=generate_booking_ref(), user_id=sarah.id,
                       station_id=station5.id, charger_id=c1_st5.id,
                       booking_date=yesterday, start_time="11:00", end_time="13:00",
                       status=models.BookingStatus.completed,
                       payment_status=models.PaymentStatus.paid, total_amount=500.0),

        models.Booking(booking_ref=generate_booking_ref(), user_id=sarah.id,
                       station_id=station2.id, charger_id=c1_st2.id,
                       booking_date=next_week, start_time="09:00", end_time="11:00",
                       status=models.BookingStatus.pending,
                       payment_status=models.PaymentStatus.pending, total_amount=400.0),

        # Mike's bookings
        models.Booking(booking_ref=generate_booking_ref(), user_id=mike.id,
                       station_id=station3.id, charger_id=c1_st3.id,
                       booking_date=today, start_time="16:00", end_time="18:00",
                       status=models.BookingStatus.confirmed,
                       payment_status=models.PaymentStatus.paid, total_amount=440.0),

        models.Booking(booking_ref=generate_booking_ref(), user_id=mike.id,
                       station_id=station1.id, charger_id=c1_st1.id,
                       booking_date=two_days_ago, start_time="12:00", end_time="14:00",
                       status=models.BookingStatus.completed,
                       payment_status=models.PaymentStatus.paid, total_amount=360.0),

        models.Booking(booking_ref=generate_booking_ref(), user_id=mike.id,
                       station_id=station5.id, charger_id=c1_st5.id,
                       booking_date=tomorrow, start_time="14:00", end_time="16:00",
                       status=models.BookingStatus.pending,
                       payment_status=models.PaymentStatus.pending, total_amount=500.0),

        models.Booking(booking_ref=generate_booking_ref(), user_id=mike.id,
                       station_id=station4.id, charger_id=c1_st4.id,
                       booking_date=yesterday, start_time="07:00", end_time="09:00",
                       status=models.BookingStatus.completed,
                       payment_status=models.PaymentStatus.paid, total_amount=360.0),
    ]

    db.add_all(bookings)
    db.commit()
    for b in bookings:
        db.refresh(b)

    # ─────────────────────────────────────────
    # CHARGING HISTORY
    # Create history records for completed bookings
    # ─────────────────────────────────────────

    completed_bookings = [b for b in bookings if b.status == models.BookingStatus.completed]

    history_records = []
    for booking in completed_bookings:
        # Calculate duration in minutes from stored time strings
        start_h, start_m = map(int, booking.start_time.split(":"))
        end_h, end_m = map(int, booking.end_time.split(":"))
        duration = (end_h * 60 + end_m) - (start_h * 60 + start_m)

        # Get charger power to estimate energy delivered
        charger = db.query(models.Charger).filter(models.Charger.id == booking.charger_id).first()
        energy = round((charger.power_kw * duration / 60) * 0.85, 2)  # 85% efficiency

        history_records.append(models.ChargingHistory(
            booking_id=booking.id,
            user_id=booking.user_id,
            station_id=booking.station_id,
            charger_id=booking.charger_id,
            energy_kwh=energy,
            duration_minutes=duration,
            amount_paid=booking.total_amount,
            started_at=datetime.utcnow() - timedelta(hours=3),
            ended_at=datetime.utcnow() - timedelta(hours=1),
        ))

    db.add_all(history_records)
    db.commit()

    # ─────────────────────────────────────────
    # FAVORITES
    # Users save their frequently used stations
    # ─────────────────────────────────────────

    favorites = [
        models.Favorite(user_id=john.id, station_id=station1.id),
        models.Favorite(user_id=john.id, station_id=station3.id),
        models.Favorite(user_id=sarah.id, station_id=station4.id),
        models.Favorite(user_id=sarah.id, station_id=station5.id),
        models.Favorite(user_id=mike.id, station_id=station2.id),
    ]
    db.add_all(favorites)
    db.commit()

    # ─────────────────────────────────────────
    # REVIEWS
    # Station ratings and comments from users
    # ─────────────────────────────────────────

    reviews = [
        models.Review(user_id=john.id, station_id=station1.id, rating=5,
                      comment="Excellent facility! Fast chargers and clean environment. Highly recommend."),
        models.Review(user_id=john.id, station_id=station2.id, rating=4,
                      comment="Good charging speeds. The 24/7 availability is very convenient."),
        models.Review(user_id=sarah.id, station_id=station4.id, rating=5,
                      comment="Perfect for office workers. Great cafeteria nearby too!"),
        models.Review(user_id=sarah.id, station_id=station5.id, rating=3,
                      comment="Fast chargers work well but can get crowded during peak hours."),
        models.Review(user_id=mike.id, station_id=station1.id, rating=4,
                      comment="Good location and reliable chargers. Wifi could be faster though."),
        models.Review(user_id=mike.id, station_id=station3.id, rating=5,
                      comment="Love the Tesla supercharger here. Very convenient location in Indiranagar."),
    ]

    db.add_all(reviews)
    db.commit()

    # ─────────────────────────────────────────
    # NOTIFICATIONS
    # In-app notifications for users
    # ─────────────────────────────────────────

    notifications = [
        models.Notification(user_id=john.id, title="Booking Confirmed!",
                            message=f"Your booking at GreenCharge Koramangala has been confirmed.",
                            type=models.NotificationType.booking, is_read=False),

        models.Notification(user_id=john.id, title="Charging Session Complete",
                            message="Your charging session at PowerUp HSR Layout is complete. ₹400 charged.",
                            type=models.NotificationType.announcement, is_read=True),

        models.Notification(user_id=sarah.id, title="Booking Confirmed!",
                            message="Your booking at ChargePoint Whitefield has been confirmed.",
                            type=models.NotificationType.booking, is_read=False),

        models.Notification(user_id=sarah.id, title="Booking Reminder",
                            message="Reminder: You have a charging session at PowerUp HSR Layout next week.",
                            type=models.NotificationType.reminder, is_read=False),

        models.Notification(user_id=mike.id, title="Booking Confirmed!",
                            message="Your booking at EV Hub Indiranagar has been confirmed.",
                            type=models.NotificationType.booking, is_read=False),

        models.Notification(user_id=mike.id, title="Booking Cancelled",
                            message="A booking at EV Hub Indiranagar has been cancelled. Refund initiated.",
                            type=models.NotificationType.cancellation, is_read=True),

        models.Notification(user_id=john.id, title="New Station Open!",
                            message="QuickCharge MG Road is now open with ultra-fast 250kW chargers!",
                            type=models.NotificationType.announcement, is_read=False),
    ]

    db.add_all(notifications)
    db.commit()

    # ─────────────────────────────────────────
    # PRICING PLANS
    # Admin-configured pricing for each charger type
    # ─────────────────────────────────────────

    pricing_plans = [
        models.Pricing(name="AC Slow Standard Plan",
                       charger_type="AC_SLOW", price_per_kwh=8.0,
                       description="Standard pricing for Level 1 AC slow charging. Best for overnight charging.",
                       is_active=True),

        models.Pricing(name="AC Fast Premium Plan",
                       charger_type="AC_FAST", price_per_kwh=12.0,
                       description="Premium pricing for Level 2 AC fast charging. Ideal for 2-4 hour sessions.",
                       is_active=True),

        models.Pricing(name="DC Fast Charging Plan",
                       charger_type="DC_FAST", price_per_kwh=18.0,
                       description="DC fast charging for rapid top-ups. 80% charge in under 30 minutes.",
                       is_active=True),

        models.Pricing(name="DC Ultra-Fast Plan",
                       charger_type="DC_FAST", price_per_kwh=25.0,
                       description="Ultra-fast DC charging (100kW+). For compatible vehicles only.",
                       is_active=True),
    ]

    db.add_all(pricing_plans)
    db.commit()

    # ─────────────────────────────────────────
    # AUDIT LOGS
    # Record that seeding occurred
    # ─────────────────────────────────────────

    audit_log = models.AuditLog(
        user_id=None,
        action="SEED",
        entity="Database",
        entity_id=None,
        details="Initial database seed completed. Created admin, 3 users, 5 stations, chargers, bookings, history, notifications, pricing.",
        ip_address="system"
    )
    db.add(audit_log)
    db.commit()

    print("[SUCCESS] Database seeded successfully!")
    print(f"   - 4 users created (1 admin, 3 regular)")
    print(f"   - 10 stations created")
    print(f"   - {len(chargers_data)} chargers created")
    print(f"   - {len(bookings)} bookings created")
    print(f"   - {len(history_records)} history records created")
    print(f"   - {len(notifications)} notifications created")
    print(f"   - {len(reviews)} reviews created")
    print(f"   - {len(pricing_plans)} pricing plans created")
