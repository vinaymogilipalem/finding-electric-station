"""
main.py - Main entry point for the FastAPI backend
Initializes the application, adds middleware (CORS, security headers),
registers API routers, and seeds the database on startup.
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from .database import engine, Base, SessionLocal
from .seed import seed_database
from .routers import (
    auth,
    users,
    stations,
    chargers,
    bookings,
    history,
    favorites,
    reviews,
    notifications,
    analytics,
    pricing,
    audit,
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database tables on startup
# This creates the SQLite file ev_chargehub.db and all tables
Base.metadata.create_all(bind=engine)

# Seed database with sample data if empty
try:
    db = SessionLocal()
    seed_database(db)
    db.close()
except Exception as e:
    logger.error(f"Error seeding database: {e}")

# Create the FastAPI app instance
app = FastAPI(
    title="EV ChargeHub API",
    description="Backend API for Electric Vehicle Charging Station Locator & Booking Platform",
    version="1.0.0",
)

# ── MIDDLEWARE ───────────────────────────────────────────────

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simple development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """
    Middleware that adds security headers to all responses.
    """
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# ── EXCEPTION HANDLERS ────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler that catches unhandled errors
    and returns a clean, structured JSON response.
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact support."},
    )


# ── REGISTER ROUTERS ──────────────────────────────────────────

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(stations.router)
app.include_router(chargers.router)
app.include_router(bookings.router)
app.include_router(history.router)
app.include_router(favorites.router)
app.include_router(reviews.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(pricing.router)
app.include_router(audit.router)


# ── ROOT ENDPOINT ─────────────────────────────────────────────

@app.get("/", tags=["Root"])
def read_root():
    """
    Root endpoint to verify that the API is up and running.
    """
    return {
        "message": "Welcome to the EV ChargeHub REST API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
