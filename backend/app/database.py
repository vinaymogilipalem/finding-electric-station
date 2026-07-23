"""
database.py - SQLAlchemy database engine and session configuration
Sets up the SQLite database connection and provides a session factory
for dependency injection throughout the app.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os
from dotenv import load_dotenv

# Load environment variables from the backend/ directory's .env file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=env_path)

# Resolve SQLALCHEMY_DATABASE_URL from environment variable or use default
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL", "sqlite:///./ev_chargehub.db")

# If SQLite is used with a relative path, resolve it relative to the backend/ directory
if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///"):
    db_file = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
    # Remove leading "./" if present
    if db_file.startswith("./"):
        db_file = db_file[2:]
    # If not an absolute path and not containing windows drive letters, resolve relative to BASE_DIR
    if not os.path.isabs(db_file) and not (len(db_file) > 1 and db_file[1] == ":"):
        DB_PATH = os.path.join(BASE_DIR, db_file)
        SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

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
