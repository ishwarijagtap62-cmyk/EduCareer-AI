"""
Database engine, session factory, and base model.
"""
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_engine(db_url: str):
    if db_url.startswith("sqlite"):
        return create_engine(
            db_url,
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG,
        )
    try:
        eng = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            echo=settings.DEBUG,
        )
        # Verify connection
        with eng.connect():
            pass
        return eng
    except Exception as e:
        logger.warning(
            f"PostgreSQL connection failed ({e}). Falling back to local SQLite database."
        )
        return create_engine(
            "sqlite:///./educareer.db",
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG,
        )


engine = get_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency: yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

