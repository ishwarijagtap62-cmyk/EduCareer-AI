"""
Jobs API — job listings, matching, and application tracking.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

from app.database.base import get_db
from app.models.user import User, StudentProfile
from app.models.jobs import Job, SavedJob, JobApplication, ApplicationStatus
from app.core.dependencies import get_current_active_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs", tags=["Jobs"])


class ApplicationCreate(BaseModel):
    job_id: str
    status: str = "saved"
    notes: Optional[str] = None
    deadline: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


@router.get("/")
async def list_jobs(
    role: Optional[str] = None,
    job_type: Optional[str] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List available jobs (demo data)."""
    query = db.query(Job).filter(Job.is_active == True)
    if role:
        query = query.filter(Job.title.ilike(f"%{role}%"))
    if job_type:
        query = query.filter(Job.job_type == job_type)

    jobs = query.order_by(Job.created_at.desc()).limit(limit).all()

    # Get student skills for match scoring
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    student_skills = set()
    if profile and profile.skills:
        student_skills = {s.name.lower() for s in profile.skills}

    result = []
    for job in jobs:
        required = job.required_skills or []
        match_score = _calculate_match(student_skills, required)
        result.append({
            "id": str(job.id),
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "job_type": job.job_type,
            "required_skills": required,
            "experience_required": job.experience_required,
            "salary_range": job.salary_range,
            "match_score": match_score,
            "is_demo": job.is_demo,
            "posted_at": job.posted_at.isoformat() if job.posted_at else None,
            "deadline": job.deadline.isoformat() if job.deadline else None,
        })

    # Sort by match score
    result.sort(key=lambda x: x["match_score"] or 0, reverse=True)
    return result


@router.get("/{job_id}")
async def get_job(
    job_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()
    student_skills = set()
    if profile and profile.skills:
        student_skills = {s.name.lower() for s in profile.skills}

    required = job.required_skills or []
    match_score = _calculate_match(student_skills, required)
    matched = [s for s in required if s.lower() in student_skills]
    missing = [s for s in required if s.lower() not in student_skills]

    return {
        "id": str(job.id),
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "job_type": job.job_type,
        "description": job.description,
        "required_skills": required,
        "nice_to_have_skills": job.nice_to_have_skills or [],
        "experience_required": job.experience_required,
        "salary_range": job.salary_range,
        "apply_url": job.apply_url,
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "is_demo": job.is_demo,
    }


# ---- Applications ----

@router.get("/applications/list")
async def list_applications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    apps = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == current_user.id)
        .order_by(JobApplication.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(a.id),
            "job": {
                "id": str(a.job_id),
                "title": a.job.title if a.job else "Unknown",
                "company": a.job.company if a.job else "Unknown",
            },
            "status": a.status.value,
            "applied_date": a.applied_date.isoformat() if a.applied_date else None,
            "deadline": a.deadline.isoformat() if a.deadline else None,
            "notes": a.notes,
            "created_at": a.created_at.isoformat(),
        }
        for a in apps
    ]


@router.post("/applications")
async def create_application(
    data: ApplicationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # Check if already applied
    existing = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id,
        JobApplication.job_id == data.job_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already tracking this application")

    try:
        status = ApplicationStatus(data.status)
    except ValueError:
        status = ApplicationStatus.SAVED

    deadline = None
    if data.deadline:
        from datetime import datetime
        try:
            deadline = datetime.fromisoformat(data.deadline)
        except ValueError:
            pass

    app = JobApplication(
        user_id=current_user.id,
        job_id=data.job_id,
        status=status,
        notes=data.notes,
        deadline=deadline,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"id": str(app.id), "status": app.status.value}


@router.patch("/applications/{app_id}")
async def update_application(
    app_id: str,
    data: ApplicationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    app = db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == current_user.id,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    try:
        app.status = ApplicationStatus(data.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {data.status}")

    if data.notes is not None:
        app.notes = data.notes

    # Track status history
    history = app.status_history or []
    history.append({"status": data.status, "timestamp": __import__("datetime").datetime.utcnow().isoformat()})
    app.status_history = history

    db.commit()
    return {"id": app_id, "status": app.status.value}


def _calculate_match(student_skills: set, required_skills: list) -> Optional[float]:
    """Calculate a simple skill match percentage."""
    if not required_skills:
        return None
    matched = sum(1 for s in required_skills if s.lower() in student_skills)
    return round((matched / len(required_skills)) * 100, 1)
