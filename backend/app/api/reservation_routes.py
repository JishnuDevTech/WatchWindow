from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import ReservationCreate, ReservationUpdate
from app.services.auth_service import AuthService
from app.services.reservation_service import ReservationService

router = APIRouter(prefix="/api", tags=["reservations"])


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get current user from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    user = AuthService.get_user_from_token(db, token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user


@router.get("/families/{family_id}/reservations")
def get_family_reservations(
    family_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Get all reservations for a family"""
    try:
        reservations = ReservationService.get_family_reservations(db, family_id)
        return {"reservations": reservations}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/users/{user_id}/reservations")
def get_user_reservations(
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Get all reservations for a user"""
    try:
        reservations = ReservationService.get_user_reservations(db, user_id)
        return {"reservations": reservations}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reservations")
def create_reservation(
    reservation_create: ReservationCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Create a new reservation"""
    try:
        reservation = ReservationService.create_reservation(
            db, user.id, reservation_create
        )
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/reservations/{reservation_id}")
def update_reservation(
    reservation_id: str,
    update_data: ReservationUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Update a reservation"""
    try:
        reservation = ReservationService.update_reservation(
            db, reservation_id, user.id, update_data
        )
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/reservations/{reservation_id}")
def cancel_reservation(
    reservation_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Cancel a reservation"""
    try:
        ReservationService.cancel_reservation(db, reservation_id, user.id)
        return {"message": "Reservation cancelled"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))