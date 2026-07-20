"""
database.py - SQLAlchemy database engine and session configuration
Sets up the SQLite database connection and provides a session factory
for dependency injection throughout the app.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL - file will be created in the backend/ root directory
SQLALCHEMY_DATABASE_URL = "sqlite:///./ev_chargehub.db"

# Create the SQLAlchemy engine
# connect_args={"check_same_thread": False} is required for SQLite
# because FastAPI can use multiple threads; this disables the thread check
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# SessionLocal is a factory that creates new database sessions
# autocommit=False: we manually commit transactions
# autoflush=False: we manually flush changes
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all SQLAlchemy ORM models
# All models will inherit from this Base
Base = declarative_base()


def get_db():
    """
    Dependency function that provides a database session for each request.
    Yields a session and ensures it's closed after the request completes,
    even if an error occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
