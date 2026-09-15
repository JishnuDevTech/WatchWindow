from sqlalchemy.orm import Session
from app.models.models import TvSchedule, User, Family
from app.services.reservation_service import ReservationService
from app.models.schemas import TvScheduleCreate, TvScheduleUpdate
from datetime import datetime
import uuid


class ScheduleService:
    """TV Schedule management service"""

    @staticmethod
    def create_event(
        db: Session, family_id: str, user_id: str, event_create: TvScheduleCreate
    ) -> TvSchedule:
        """Create a viewing event"""
        # Get date from start_time
        date = event_create.start_time.strftime("%Y-%m-%d")

        event = TvSchedule(
            id=str(uuid.uuid4()),
            family_id=family_id,
            user_id=user_id,
            title=event_create.title,
            description=event_create.description,
            start_time=event_create.start_time,
            end_time=event_create.end_time,
            date=date,
            status=event_create.status,
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        return ScheduleService._enrich_event(db, event)

    @staticmethod
    def get_family_schedule(
        db: Session, family_id: str, date: str = None
    ) -> list:
        """Get all events for a family (optionally filtered by date)"""
        query = db.query(TvSchedule).filter(TvSchedule.family_id == family_id)

        if date:
            query = query.filter(TvSchedule.date == date)

        events = query.order_by(TvSchedule.start_time).all()
        return [ScheduleService._enrich_event(db, e) for e in events]

    @staticmethod
    def get_event(db: Session, family_id: str, event_id: str) -> TvSchedule:
        """Get a specific event"""
        event = (
            db.query(TvSchedule)
            .filter(
                TvSchedule.id == event_id, TvSchedule.family_id == family_id
            )
            .first()
        )

        if not event:
            raise ValueError("Event not found")

        return ScheduleService._enrich_event(db, event)

    @staticmethod
    def update_event(
        db: Session, family_id: str, event_id: str, update_data: TvScheduleUpdate
    ) -> TvSchedule:
        """Update an event"""
        event = (
            db.query(TvSchedule)
            .filter(
                TvSchedule.id == event_id, TvSchedule.family_id == family_id
            )
            .first()
        )

        if not event:
            raise ValueError("Event not found")

        update_dict = update_data.model_dump(exclude_unset=True)

        # Update date if start_time changed
        if "start_time" in update_dict and update_dict["start_time"]:
            update_dict["date"] = update_dict["start_time"].strftime("%Y-%m-%d")

        for key, value in update_dict.items():
            setattr(event, key, value)

        event.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(event)

        return ScheduleService._enrich_event(db, event)

    @staticmethod
    def delete_event(db: Session, family_id: str, event_id: str):
        """Delete an event"""
        event = (
            db.query(TvSchedule)
            .filter(
                TvSchedule.id == event_id, TvSchedule.family_id == family_id
            )
            .first()
        )

        if not event:
            raise ValueError("Event not found")

        db.delete(event)
        db.commit()

    @staticmethod
    def _enrich_event(db: Session, event: TvSchedule) -> dict:
        """Enrich event with member name"""
        user = db.query(User).filter(User.id == event.user_id).first()

        return {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "memberId": event.user_id,
            "memberName": user.name if user else "Unknown",
            "startTime": event.start_time.isoformat(),
            "endTime": event.end_time.isoformat(),
            "date": event.date,
            "status": event.status,
            "createdAt": event.created_at.isoformat(),
            "updatedAt": event.updated_at.isoformat(),
        }

    @staticmethod
    def get_available_slots(
        db: Session,
        family_id: str,
        date: str,
        duration_minutes: int = 60,
        earliest_time: str = "06:00",
        latest_time: str = "23:00",
        user_id: str = None,
    ) -> list:
        return ReservationService.get_available_slots(
            db,
            family_id,
            date,
            duration_minutes,
            earliest_time,
            latest_time,
            user_id,
        )