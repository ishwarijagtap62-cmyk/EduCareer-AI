"""
Student Profile API.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.base import get_db
from app.models.user import User, StudentProfile
from app.models.skills import StudentSkill, Project, Certification
from app.schemas.profile import (
    ProfileUpdate, ProfileOut, SkillCreate, SkillOut,
    ProjectCreate, ProjectOut, PlacementScoreOut
)
from app.core.dependencies import get_current_active_user

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/", response_model=ProfileOut)
async def get_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/", response_model=ProfileOut)
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    for field, value in data.dict(exclude_none=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/skills", response_model=SkillOut, status_code=201)
async def add_skill(
    data: SkillCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(current_user, db)
    skill = StudentSkill(
        profile_id=profile.id,
        name=data.name,
        category=data.category,
        level=data.level,
        proficiency=data.proficiency,
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/skills/{skill_id}", status_code=204)
async def delete_skill(
    skill_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(current_user, db)
    skill = db.query(StudentSkill).filter(
        StudentSkill.id == skill_id,
        StudentSkill.profile_id == profile.id
    ).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()


@router.post("/projects", response_model=ProjectOut, status_code=201)
async def add_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(current_user, db)
    project = Project(
        profile_id=profile.id,
        title=data.title,
        description=data.description,
        technologies=data.technologies,
        github_url=data.github_url,
        live_url=data.live_url,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/placement-score", response_model=PlacementScoreOut)
async def get_placement_score(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    scores = [
        profile.resume_score,
        profile.technical_score,
        profile.dsa_score,
        profile.projects_score,
        profile.interview_score,
        profile.communication_score,
    ]
    valid_scores = [s for s in scores if s is not None]
    overall = round(sum(valid_scores) / len(valid_scores), 1) if valid_scores else None

    return {
        "resume_score": profile.resume_score,
        "technical_score": profile.technical_score,
        "dsa_score": profile.dsa_score,
        "projects_score": profile.projects_score,
        "interview_score": profile.interview_score,
        "communication_score": profile.communication_score,
        "overall_score": overall,
        "score_sources": profile.score_sources or {},
        "label": "AI-Estimated",
    }


def _get_or_create_profile(user: User, db: Session) -> StudentProfile:
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.flush()
    return profile
