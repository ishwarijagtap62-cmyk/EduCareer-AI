"""
Authentication schemas.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str
    onboarding_completed: bool


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class OnboardingData(BaseModel):
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = Field(None, ge=1, le=6)
    skills: list[str] = []
    interests: list[str] = []
    target_career: Optional[str] = None
    target_job_role: Optional[str] = None
    experience_level: str = "beginner"
    cgpa: Optional[float] = Field(None, ge=0.0, le=10.0)


class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    is_active: bool
    onboarding_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
