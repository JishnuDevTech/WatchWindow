from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import AuthResponse, SignInRequest, UserCreate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
def signup(user_create: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        return AuthService.signup(db, user_create)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin", response_model=AuthResponse)
def signin(signin_request: SignInRequest, db: Session = Depends(get_db)):
    """Sign in a user"""
    try:
        return AuthService.signin(db, signin_request.email, signin_request.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/verify")
def verify_token(token: str):
    """Verify a JWT token"""
    payload = AuthService.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"valid": True, "uid": payload.get("sub")}