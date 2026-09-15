from sqlalchemy.orm import Session
from app.models.models import FamilyMember, Reservation, TvSchedule, User
from app.models.schemas import ReservationCreate, ReservationUpdate
from datetime import datetime, timedelta
import uuid


class ReservationService:
    """Reservation management service"""

    @staticmethod
    def create_reservation(
        db: Session, user_id: str, reservation_create: ReservationCreate
    ) -> dict:
        ReservationService._ensure_family_member(
            db, reservation_create.family_id, user_id
        )
        ReservationService._ensure_available(
            db,
            reservation_create.family_id,
            reservation_create.start_time,
            reservation_create.end_time,
        )

        reservation = Reservation(
            id=str(uuid.uuid4()),
            family_id=reservation_create.family_id,
            user_id=user_id,
            title=reservation_create.title,
            description=reservation_create.description,
            start_time=reservation_create.start_time,
            end_time=reservation_create.end_time,
            status="confirmed",
        )
        db.add(reservation)
        db.commit()
        db.refresh(reservation)

        return ReservationService._enrich_reservation(db, reservation)

    @staticmethod
    def get_family_reservations(db: Session, family_id: str) -> list:
        """Get all reservations for a family"""
        reservations = (
            db.query(Reservation)
            .filter(
                Reservation.family_id == family_id,
                Reservation.status != "cancelled",
            )
            .order_by(Reservation.created_at.desc())
            .all()
        )

        return [ReservationService._enrich_reservation(db, r) for r in reservations]

    @staticmethod
    def get_user_reservations(db: Session, user_id: str) -> list:
        """Get all reservations for a user"""
        reservations = (
            db.query(Reservation)
            .filter(
                Reservation.user_id == user_id,
                Reservation.status != "cancelled",
            )
            .order_by(Reservation.created_at.desc())
            .all()
        )

        return [ReservationService._enrich_reservation(db, r) for r in reservations]

    @staticmethod
    def update_reservation(
        db: Session, reservation_id: str, user_id: str, update_data: ReservationUpdate
    ) -> dict:
        """Update a reservation"""
        reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()

        if not reservation:
            raise ValueError("Reservation not found")
        if reservation.user_id != user_id:
            raise ValueError("You can only update your own reservations")

        update_dict = update_data.model_dump(exclude_unset=True)
        start_time = update_dict.get("start_time", reservation.start_time)
        end_time = update_dict.get("end_time", reservation.end_time)
        if start_time >= end_time:
            raise ValueError("End time must be later than start time")
        ReservationService._ensure_available(
            db,
            reservation.family_id,
            start_time,
            end_time,
            exclude_id=reservation.id,
        )

        for key, value in update_dict.items():
            setattr(reservation, key, value)

        reservation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(reservation)

        return ReservationService._enrich_reservation(db, reservation)

    @staticmethod
    def cancel_reservation(db: Session, reservation_id: str, user_id: str):
        """Cancel a reservation"""
        reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()

        if not reservation:
            raise ValueError("Reservation not found")
        if reservation.user_id != user_id:
            raise ValueError("You can only cancel your own reservations")

        reservation.status = "cancelled"
        reservation.updated_at = datetime.utcnow()
        db.commit()

    @staticmethod
    def _ensure_family_member(db: Session, family_id: str, user_id: str):
        member = (
            db.query(FamilyMember)
            .filter(
                FamilyMember.family_id == family_id,
                FamilyMember.user_id == user_id,
            )
            .first()
        )
        if not member:
            raise ValueError("You must belong to this family")

    @staticmethod
    def _ensure_available(
        db: Session,
        family_id: str,
        start_time: datetime,
        end_time: datetime,
        exclude_id: str = None,
    ):
        reservation_query = db.query(Reservation).filter(
            Reservation.family_id == family_id,
            Reservation.status != "cancelled",
            Reservation.start_time < end_time,
            Reservation.end_time > start_time,
        )
        if exclude_id:
            reservation_query = reservation_query.filter(Reservation.id != exclude_id)

        schedule_query = db.query(TvSchedule).filter(
            TvSchedule.family_id == family_id,
            TvSchedule.status != "cancelled",
            TvSchedule.start_time < end_time,
            TvSchedule.end_time > start_time,
        )
        if reservation_query.first() or schedule_query.first():
            raise ValueError("That TV window is no longer available")

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
        if user_id:
            ReservationService._ensure_family_member(db, family_id, user_id)
        try:
            selected_date = datetime.strptime(date, "%Y-%m-%d").date()
            earliest = datetime.strptime(earliest_time, "%H:%M").time()
            latest = datetime.strptime(latest_time, "%H:%M").time()
        except ValueError as exc:
            raise ValueError("Use date YYYY-MM-DD and times HH:MM") from exc

        if duration_minutes < 15 or duration_minutes > 480:
            raise ValueError("Duration must be between 15 and 480 minutes")
        window_start = datetime.combine(selected_date, earliest)
        window_end = datetime.combine(selected_date, latest)
        if window_start >= window_end:
            raise ValueError("Latest time must be later than earliest time")

        busy = db.query(TvSchedule).filter(
            TvSchedule.family_id == family_id,
            TvSchedule.date == date,
            TvSchedule.status != "cancelled",
        ).all()
        busy += db.query(Reservation).filter(
            Reservation.family_id == family_id,
            Reservation.status != "cancelled",
            Reservation.start_time < window_end,
            Reservation.end_time > window_start,
        ).all()

        slots = []
        candidate = window_start
        step = 30
        while candidate + timedelta(minutes=duration_minutes) <= window_end:
            candidate_end = candidate + timedelta(minutes=duration_minutes)
            overlaps = any(
                item.start_time < candidate_end and item.end_time > candidate
                for item in busy
            )
            if not overlaps:
                slots.append(
                    {
                        "startTime": candidate.isoformat(),
                        "endTime": candidate_end.isoformat(),
                        "durationMinutes": duration_minutes,
                    }
                )
            candidate += timedelta(minutes=step)
        return slots

    @staticmethod
    def _enrich_reservation(db: Session, reservation: Reservation) -> dict:
        """Enrich reservation with member name"""
        user = db.query(User).filter(User.id == reservation.user_id).first()

        return {
            "id": reservation.id,
            "familyId": reservation.family_id,
            "userId": reservation.user_id,
            "memberName": user.name if user else "Unknown",
            "title": reservation.title,
            "description": reservation.description,
            "startTime": reservation.start_time.isoformat(),
            "endTime": reservation.end_time.isoformat(),
            "status": reservation.status,
            "createdAt": reservation.created_at.isoformat(),
            "updatedAt": reservation.updated_at.isoformat(),
        }