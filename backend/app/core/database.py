from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Create engine
engine_options = {"echo": settings.debug, "pool_pre_ping": True}
if settings.database_url.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
else:
    engine_options.update({"pool_size": 10, "max_overflow": 20})

engine = create_engine(settings.database_url, **engine_options)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base for models
Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables"""
    from app.models import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def drop_tables():
    """Drop all tables (dev only)"""
    Base.metadata.drop_all(bind=engine)