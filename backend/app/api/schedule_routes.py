from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import TvScheduleCreate, TvScheduleUpdate, TvScheduleResponse
from app.services.auth_service import AuthService
from app.services.schedule_service import ScheduleService

router = APIRouter(prefix="/api", tags=["schedule"])


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get current user from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    user = AuthService.get_user_from_token(db, token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user


@router.get("/families/{family_id}/schedule")
def get_family_schedule(
    family_id: str,
    date: str = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Get schedule for a family"""
    try:
        events = ScheduleService.get_family_schedule(db, family_id, date)
        return {"schedules": events}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/families/{family_id}/schedule")
def create_event(
    family_id: str,
    event_create: TvScheduleCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Create a viewing event"""
    try:
        event = ScheduleService.create_event(db, family_id, user.id, event_create)
        return event
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/families/{family_id}/schedule/{event_id}")
def get_event(
    family_id: str,
    event_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Get a specific event"""
    try:
        event = ScheduleService.get_event(db, family_id, event_id)
        return event
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/families/{family_id}/schedule/{event_id}")
def update_event(
    family_id: str,
    event_id: str,
    update_data: TvScheduleUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Update an event"""
    try:
        event = ScheduleService.update_event(db, family_id, event_id, update_data)
        return event
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/families/{family_id}/schedule/{event_id}")
def delete_event(
    family_id: str,
    event_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Delete an event"""
    try:
        ScheduleService.delete_event(db, family_id, event_id)
        return {"message": "Event deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/families/{family_id}/available-slots")
def get_available_slots(
    family_id: str,
    date: str = Query(...),
    duration_minutes: int = Query(60, ge=15, le=480),
    earliest_time: str = Query("06:00"),
    latest_time: str = Query("23:00"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Get available time slots for scheduling"""
    try:
        slots = ScheduleService.get_available_slots(
            db,
            family_id,
            date,
            duration_minutes,
            earliest_time,
            latest_time,
            user.id,
        )
        return {"slots": slots}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))