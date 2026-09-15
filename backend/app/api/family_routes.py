from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import FamilyCreate, FamilyResponse, FamilyJoinRequest
from app.services.auth_service import AuthService
from app.services.family_service import FamilyService

router = APIRouter(prefix="/api", tags=["family"])


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get current user from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    user = AuthService.get_user_from_token(db, token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user


@router.get("/users/families")
def get_user_families(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    """Get all families for current user"""
    families = FamilyService.get_user_families(db, user)
    return {"families": families}


@router.post("/families", response_model=FamilyResponse)
def create_family(
    family_create: FamilyCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Create a new family"""
    try:
        family = FamilyService.create_family(db, user, family_create)
        return FamilyResponse(
            id=family.id,
            name=family.name,
            description=family.description,
            tv_name=family.tv_name,
            invite_code=family.invite_code,
            created_at=family.created_at,
            updated_at=family.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/families/join")
def join_family(
    join_request: FamilyJoinRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Join a family with invite code"""
    try:
        family = FamilyService.join_family(db, user, join_request.invite_code)
        return {
            "message": "Successfully joined family",
            "family": {
                "id": family.id,
                "name": family.name,
                "inviteCode": family.invite_code,
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/families/{family_id}/members")
def get_family_members(
    family_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Get all members of a family"""
    try:
        members = FamilyService.get_family_members(db, family_id)
        return {"members": members}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/families/{family_id}/invite-code")
def get_invite_code(
    family_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Get the invite code for a family"""
    try:
        code = FamilyService.get_invite_code(db, family_id)
        return {"invite_code": code}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/families/{family_id}/invite")
def invite_member(
    family_id: str,
    email: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Invite a member to a family"""
    try:
        FamilyService.invite_member(db, family_id, email)
        return {"message": f"Invite sent to {email}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))