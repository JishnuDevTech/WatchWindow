from sqlalchemy.orm import Session
from sqlalchemy import select
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.models.models import User
from app.models.schemas import AuthResponse, UserCreate
from app.core.config import settings
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication service"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against hash"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.access_token_expire_minutes
            )

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
        )
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(
                token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
            )
            return payload
        except JWTError:
            return None

    @staticmethod
    def signup(db: Session, user_create: UserCreate) -> AuthResponse:
        """Register a new user"""
        # Check if user exists
        existing = db.query(User).filter(User.email == user_create.email).first()
        if existing:
            raise ValueError("Email already registered")

        # Create user (in real app, would verify with Firebase)
        user = User(
            id=str(uuid.uuid4()),
            uid=str(uuid.uuid4()),  # Firebase UID in production
            email=user_create.email,
            name=user_create.name,
            password_hash=AuthService.hash_password(user_create.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create token
        token = AuthService.create_access_token(
            {"sub": user.uid, "email": user.email}
        )

        return AuthResponse(
            uid=user.uid, email=user.email, name=user.name, token=token
        )

    @staticmethod
    def signin(db: Session, email: str, password: str) -> AuthResponse:
        """Authenticate user (mock - production would use Firebase)"""
        user = db.query(User).filter(User.email == email).first()

        if not user:
            raise ValueError("Invalid email or password")

        if not AuthService.verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password")

        # Create token
        token = AuthService.create_access_token(
            {"sub": user.uid, "email": user.email}
        )

        return AuthResponse(
            uid=user.uid, email=user.email, name=user.name, token=token
        )

    @staticmethod
    def get_user_from_token(db: Session, token: str) -> User:
        """Get user from token"""
        payload = AuthService.verify_token(token)
        if not payload:
            return None

        uid = payload.get("sub")
        if not uid:
            return None

        return db.query(User).filter(User.uid == uid).first()