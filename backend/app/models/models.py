from sqlalchemy import CheckConstraint, Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class User(Base):
    """User model linked to Firebase UID"""

    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    uid = Column(String, unique=True, index=True, nullable=False)  # Firebase UID
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    family_members = relationship("FamilyMember", back_populates="user", cascade="all, delete-orphan")
    tv_schedules = relationship("TvSchedule", back_populates="user", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="user", cascade="all, delete-orphan")


class Family(Base):
    """Family/household model"""

    __tablename__ = "families"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    invite_code = Column(String, unique=True, index=True, nullable=False)
    tv_name = Column(String, default="Living Room TV")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    family_members = relationship("FamilyMember", back_populates="family", cascade="all, delete-orphan")
    tv_schedules = relationship("TvSchedule", back_populates="family", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="family", cascade="all, delete-orphan")


class FamilyMember(Base):
    """Relationship between users and families"""

    __tablename__ = "family_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    family_id = Column(String, ForeignKey("families.id"), nullable=False, index=True)
    role = Column(String, default="member")  # admin, member
    avatar = Column(String)  # Emoji or URL
    joined_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="family_members")
    family = relationship("Family", back_populates="family_members")


class TvSchedule(Base):
    """Viewing events on the shared TV"""

    __tablename__ = "tv_schedules"
    __table_args__ = (
        CheckConstraint("start_time < end_time", name="ck_tv_schedule_time_range"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    family_id = Column(String, ForeignKey("families.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    date = Column(String, index=True)  # YYYY-MM-DD for quick filtering
    status = Column(String, default="scheduled")  # scheduled, ongoing, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    family = relationship("Family", back_populates="tv_schedules")
    user = relationship("User", back_populates="tv_schedules")


class Reservation(Base):
    """Member's reserved viewing window"""

    __tablename__ = "reservations"
    __table_args__ = (
        CheckConstraint("start_time < end_time", name="ck_reservation_time_range"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    family_id = Column(String, ForeignKey("families.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # pending, confirmed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    family = relationship("Family", back_populates="reservations")
    user = relationship("User", back_populates="reservations")