"""
Analytics API — learning progress, skill growth, interview performance.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.base import get_db
from app.models.user import User, StudentProfile
from app.models.conversation import Conversation, Message
from app.models.interview import Interview, Viva, Assessment
from app.models.jobs import JobApplication
from app.models.study import StudyPlan, StudyTask, TaskStatus
from app.core.dependencies import get_current_active_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def get_analytics_overview(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get complete analytics overview for the student."""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()

    # Conversations
    total_conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).count()
    total_messages = (
        db.query(Message)
        .join(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .count()
    )

    # Study
    study_plans = db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user.id
    ).all()
    total_tasks = 0
    completed_tasks = 0
    for plan in study_plans:
        total_tasks += len(plan.tasks)
        completed_tasks += sum(1 for t in plan.tasks if t.status == TaskStatus.COMPLETED)

    # Interviews
    interviews = db.query(Interview).filter(
        Interview.user_id == current_user.id
    ).all()
    completed_interviews = [i for i in interviews if i.status.value == "completed"]
    avg_interview_score = None
    if completed_interviews and any(i.overall_score for i in completed_interviews):
        scores = [i.overall_score for i in completed_interviews if i.overall_score]
        avg_interview_score = round(sum(scores) / len(scores), 1) if scores else None

    # Applications
    applications = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    ).all()
    app_by_status = {}
    for a in applications:
        key = a.status.value
        app_by_status[key] = app_by_status.get(key, 0) + 1

    # Skills summary
    skills_count = 0
    if profile and profile.skills:
        skills_count = len(profile.skills)

    return {
        "ai_usage": {
            "total_conversations": total_conversations,
            "total_messages": total_messages,
        },
        "learning": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round((completed_tasks / total_tasks) * 100, 1) if total_tasks else 0,
            "active_plans": sum(1 for p in study_plans if p.is_active),
        },
        "interviews": {
            "total": len(interviews),
            "completed": len(completed_interviews),
            "average_score": avg_interview_score,
        },
        "applications": {
            "total": len(applications),
            "by_status": app_by_status,
        },
        "skills": {
            "total": skills_count,
        },
        "scores": {
            "placement_readiness": profile.placement_readiness_score if profile else None,
            "resume": profile.resume_score if profile else None,
            "technical": profile.technical_score if profile else None,
            "dsa": profile.dsa_score if profile else None,
            "interview": profile.interview_score if profile else None,
            "disclaimer": "AI-Estimated",
        },
    }


@router.get("/skill-growth")
async def get_skill_growth(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get skill proficiency data for charting."""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()

    if not profile or not profile.skills:
        return {"skills": [], "message": "No skills data yet"}

    skills_data = [
        {
            "name": s.name,
            "proficiency": s.proficiency or 50,
            "level": s.level.value,
            "status": s.status.value,
            "category": s.category or "General",
        }
        for s in profile.skills
    ]

    # Group by category
    by_category = {}
    for skill in skills_data:
        cat = skill["category"]
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(skill)

    return {
        "skills": skills_data,
        "by_category": by_category,
        "total": len(skills_data),
        "avg_proficiency": round(
            sum(s["proficiency"] for s in skills_data) / len(skills_data), 1
        ),
    }


@router.get("/interview-performance")
async def get_interview_performance(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get interview history for performance charting."""
    interviews = (
        db.query(Interview)
        .filter(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.asc())
        .limit(20)
        .all()
    )

    data = [
        {
            "id": str(i.id),
            "type": i.interview_type.value,
            "score": i.overall_score,
            "role": i.target_role,
            "date": i.created_at.strftime("%b %d"),
            "status": i.status.value,
        }
        for i in interviews
    ]

    vivas = (
        db.query(Viva)
        .filter(Viva.user_id == current_user.id)
        .order_by(Viva.created_at.asc())
        .limit(10)
        .all()
    )

    viva_data = [
        {
            "id": str(v.id),
            "subject": v.subject,
            "score": v.overall_score,
            "date": v.created_at.strftime("%b %d"),
            "status": v.status.value,
        }
        for v in vivas
    ]

    return {
        "interviews": data,
        "vivas": viva_data,
    }
