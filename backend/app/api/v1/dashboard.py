"""
Dashboard API — aggregated student data.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.base import get_db
from app.models.user import User, StudentProfile
from app.models.conversation import Conversation, Message
from app.models.study import StudyPlan, StudyTask, TaskStatus
from app.models.interview import Interview, Viva
from app.models.jobs import JobApplication
from app.core.dependencies import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
async def get_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Return aggregated dashboard data for the student."""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()

    # Scores
    placement_score = None
    if profile:
        scores = [
            profile.resume_score, profile.technical_score,
            profile.dsa_score, profile.projects_score,
            profile.interview_score, profile.communication_score,
        ]
        valid = [s for s in scores if s is not None]
        placement_score = round(sum(valid) / len(valid), 1) if valid else None

    # Recent conversations
    recent_convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id, Conversation.is_active == True)
        .order_by(Conversation.updated_at.desc())
        .limit(5)
        .all()
    )

    # Active study plans
    active_plans = (
        db.query(StudyPlan)
        .filter(StudyPlan.user_id == current_user.id, StudyPlan.is_active == True)
        .limit(3)
        .all()
    )

    # Upcoming tasks
    from datetime import date
    today = date.today()
    upcoming_tasks = (
        db.query(StudyTask)
        .join(StudyPlan)
        .filter(
            StudyPlan.user_id == current_user.id,
            StudyTask.status == TaskStatus.PENDING,
        )
        .order_by(StudyTask.scheduled_date.asc())
        .limit(5)
        .all()
    )

    # Application stats
    applications = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == current_user.id)
        .all()
    )
    app_stats = {
        "total": len(applications),
        "active": len([a for a in applications if a.status.value not in ["selected", "rejected"]]),
    }

    # Interview history
    recent_interviews = (
        db.query(Interview)
        .filter(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.desc())
        .limit(3)
        .all()
    )

    return {
        "user": {
            "id": str(current_user.id),
            "name": current_user.name,
            "email": current_user.email,
            "onboarding_completed": current_user.onboarding_completed,
        },
        "profile": {
            "college": profile.college if profile else None,
            "degree": profile.degree if profile else None,
            "branch": profile.branch if profile else None,
            "year": profile.year if profile else None,
            "target_career": profile.target_career if profile else None,
            "target_job_role": profile.target_job_role if profile else None,
            "skills": [s.name for s in (profile.skills if profile else [])],
        },
        "scores": {
            "placement_readiness": placement_score,
            "resume": profile.resume_score if profile else None,
            "technical": profile.technical_score if profile else None,
            "dsa": profile.dsa_score if profile else None,
            "projects": profile.projects_score if profile else None,
            "interview": profile.interview_score if profile else None,
            "communication": profile.communication_score if profile else None,
            "score_label": "AI-Estimated",
        },
        "recent_conversations": [
            {
                "id": str(c.id),
                "title": c.title,
                "mode": c.mode.value,
                "last_agent": c.last_agent_used,
                "updated_at": c.updated_at.isoformat(),
            }
            for c in recent_convs
        ],
        "active_study_plans": [
            {
                "id": str(p.id),
                "subject": p.subject,
                "progress": p.progress_percentage,
                "exam_date": p.exam_date.isoformat() if p.exam_date else None,
            }
            for p in active_plans
        ],
        "upcoming_tasks": [
            {
                "id": str(t.id),
                "title": t.title,
                "topic": t.topic,
                "scheduled_date": t.scheduled_date.isoformat() if t.scheduled_date else None,
                "priority": t.priority,
            }
            for t in upcoming_tasks
        ],
        "applications": app_stats,
        "recent_interviews": [
            {
                "id": str(i.id),
                "type": i.interview_type.value,
                "score": i.overall_score,
                "role": i.target_role,
                "created_at": i.created_at.isoformat(),
            }
            for i in recent_interviews
        ],
    }
