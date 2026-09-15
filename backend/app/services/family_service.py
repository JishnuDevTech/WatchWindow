from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.models import Family, FamilyMember, User
from app.models.schemas import FamilyCreate, FamilyResponse
import uuid
import random
import string


class FamilyService:
    """Family management service"""

    @staticmethod
    def generate_invite_code() -> str:
        """Generate a unique invite code"""
        return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

    @staticmethod
    def create_family(db: Session, user: User, family_create: FamilyCreate) -> Family:
        """Create a new family"""
        # Generate unique invite code
        invite_code = FamilyService.generate_invite_code()
        while db.query(Family).filter(Family.invite_code == invite_code).first():
            invite_code = FamilyService.generate_invite_code()

        # Create family
        family = Family(
            id=str(uuid.uuid4()),
            name=family_create.name,
            description=family_create.description,
            invite_code=invite_code,
            tv_name=family_create.tv_name,
        )
        db.add(family)
        db.flush()

        # Add creator as admin member
        member = FamilyMember(
            id=str(uuid.uuid4()),
            user_id=user.id,
            family_id=family.id,
            role="admin",
        )
        db.add(member)
        db.commit()
        db.refresh(family)

        return family

    @staticmethod
    def get_family_members(db: Session, family_id: str) -> list:
        """Get all members of a family"""
        members = (
            db.query(FamilyMember).filter(FamilyMember.family_id == family_id).all()
        )

        # Enrich with user data
        result = []
        for member in members:
            user = db.query(User).filter(User.id == member.user_id).first()
            if user:
                result.append(
                    {
                        "id": member.id,
                        "uid": user.uid,
                        "name": user.name,
                        "email": user.email,
                        "role": member.role,
                        "avatar": member.avatar,
                        "joinedAt": member.joined_at,
                    }
                )

        return result

    @staticmethod
    def get_user_families(db: Session, user: User) -> list:
        """Get all families for a user"""
        family_members = (
            db.query(FamilyMember).filter(FamilyMember.user_id == user.id).all()
        )

        families = []
        for fm in family_members:
            family = db.query(Family).filter(Family.id == fm.family_id).first()
            if family:
                families.append(
                    {
                        "id": family.id,
                        "name": family.name,
                        "description": family.description,
                        "inviteCode": family.invite_code,
                        "tvName": family.tv_name,
                        "createdAt": family.created_at,
                    }
                )

        return families

    @staticmethod
    def join_family(db: Session, user: User, invite_code: str) -> Family:
        """Join a family with invite code"""
        family = db.query(Family).filter(Family.invite_code == invite_code).first()
        if not family:
            raise ValueError("Invalid invite code")

        # Check if user is already a member
        existing = (
            db.query(FamilyMember)
            .filter(
                FamilyMember.family_id == family.id,
                FamilyMember.user_id == user.id,
            )
            .first()
        )
        if existing:
            raise ValueError("Already a member of this family")

        # Add user to family
        member = FamilyMember(
            id=str(uuid.uuid4()),
            user_id=user.id,
            family_id=family.id,
            role="member",
        )
        db.add(member)
        db.commit()

        return family

    @staticmethod
    def invite_member(db: Session, family_id: str, email: str):
        """Invite a member by email (placeholder for email service)"""
        family = db.query(Family).filter(Family.id == family_id).first()
        if not family:
            raise ValueError("Family not found")

        # In production, would send email with invite link
        # For now, just return success
        return {"message": f"Invite sent to {email}"}

    @staticmethod
    def get_invite_code(db: Session, family_id: str) -> str:
        """Get the invite code for a family"""
        family = db.query(Family).filter(Family.id == family_id).first()
        if not family:
            raise ValueError("Family not found")

        return family.invite_code