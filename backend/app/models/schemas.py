from pydantic import BaseModel, EmailStr, Field, model_validator
from datetime import datetime
from typing import Optional, List


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    uid: str
    created_at: datetime

    class Config:
        from_attributes = True


# Family Schemas
class FamilyBase(BaseModel):
    name: str
    description: Optional[str] = None
    tv_name: Optional[str] = "Living Room TV"


class FamilyCreate(FamilyBase):
    pass


class FamilyResponse(FamilyBase):
    id: str
    invite_code: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Family Member Schemas
class FamilyMemberBase(BaseModel):
    role: str = "member"
    avatar: Optional[str] = None


class FamilyMemberResponse(BaseModel):
    id: str
    user_id: str
    family_id: str
    role: str
    avatar: Optional[str]
    joined_at: datetime
    name: str
    email: str

    class Config:
        from_attributes = True


# TV Schedule Schemas
class TvScheduleBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: str = "scheduled"

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time >= self.end_time:
            raise ValueError("End time must be later than start time")
        return self


class TvScheduleCreate(TvScheduleBase):
    pass


class TvScheduleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None


class TvScheduleResponse(TvScheduleBase):
    id: str
    family_id: str
    user_id: str
    date: str
    member_name: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Reservation Schemas
class ReservationBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time >= self.end_time:
            raise ValueError("End time must be later than start time")
        return self


class ReservationCreate(ReservationBase):
    family_id: str


class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class ReservationResponse(ReservationBase):
    id: str
    family_id: str
    user_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Auth Schemas
class AuthResponse(BaseModel):
    uid: str
    email: str
    name: str
    token: str
    token_type: str = "bearer"


class FamilyJoinRequest(BaseModel):
    invite_code: str


# Generic Response Schemas
class MessageResponse(BaseModel):
    message: str


class ListResponse(BaseModel):
    count: int
    data: list