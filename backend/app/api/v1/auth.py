"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.models.user import User, StudentProfile, UserRole
from app.models.skills import StudentSkill, CareerGoal
from app.models.memory import UserMemory
from app.schemas.auth import (
    UserRegister, UserLogin, TokenResponse,
    OnboardingData, UserOut, RefreshTokenRequest
)
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token
)
from app.core.dependencies import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new student account."""
    if db.query(User).filter(User.email == data.email.lower()).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        role=UserRole.STUDENT,
    )
    db.add(user)
    db.flush()

    profile = StudentProfile(user_id=user.id)
    db.add(profile)

    memory = UserMemory(user_id=user.id)
    db.add(memory)

    db.commit()
    db.refresh(user)

    return _create_tokens(user)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and return tokens."""
    user = db.query(User).filter(
        User.email == data.email.lower(),
        User.is_active == True
    ).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return _create_tokens(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token."""
    payload = decode_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    import uuid
    user_id = payload.get("sub")
    try:
        user_uuid = uuid.UUID(str(user_id)) if isinstance(user_id, str) else user_id
    except Exception:
        user_uuid = user_id
    user = db.query(User).filter(User.id == user_uuid, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return _create_tokens(user)


@router.post("/onboarding")
async def complete_onboarding(
    data: OnboardingData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Complete student onboarding."""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    profile.college = data.college
    profile.degree = data.degree
    profile.branch = data.branch
    profile.year = data.year
    profile.target_career = data.target_career
    profile.target_job_role = data.target_job_role
    profile.experience_level = data.experience_level
    profile.interests = data.interests
    profile.cgpa = data.cgpa

    for skill_name in data.skills:
        existing = db.query(StudentSkill).filter(
            StudentSkill.profile_id == profile.id,
            StudentSkill.name == skill_name
        ).first()
        if not existing:
            db.add(StudentSkill(profile_id=profile.id, name=skill_name))

    if data.target_job_role:
        db.add(CareerGoal(profile_id=profile.id, role=data.target_job_role, is_primary=True))

    memory = db.query(UserMemory).filter(UserMemory.user_id == current_user.id).first()
    if memory:
        memory.target_career = data.target_career
        memory.target_role = data.target_job_role

    current_user.onboarding_completed = True
    db.commit()

    return {"message": "Onboarding completed successfully"}


@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_active_user),
):
    """Get current user info."""
    return current_user


def _create_tokens(user: User) -> dict:
    token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
        "user_id": str(user.id),
        "name": user.name,
        "role": user.role.value,
        "onboarding_completed": user.onboarding_completed,
    }
