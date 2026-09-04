"""
Admin API — system analytics and user management.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.base import get_db
from app.models.user import User, UserRole
from app.models.conversation import Conversation, Message
from app.models.memory import AgentExecution
from app.core.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/analytics")
async def get_admin_analytics(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """System-wide analytics for admins."""
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    active_users = db.query(User).filter(
        User.role == UserRole.STUDENT, User.is_active == True
    ).count()
    total_conversations = db.query(Conversation).count()
    total_messages = db.query(Message).count()
    total_ai_requests = db.query(AgentExecution).count()

    # Agent usage
    agent_usage = (
        db.query(
            AgentExecution.agents_used,
            func.count(AgentExecution.id).label("count")
        )
        .group_by(AgentExecution.agents_used)
        .limit(10)
        .all()
    )

    return {
        "users": {
            "total_students": total_students,
            "active_users": active_users,
        },
        "ai_activity": {
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "total_ai_requests": total_ai_requests,
        },
    }


@router.get("/users")
async def list_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
):
    """List students — no sensitive data exposed."""
    users = (
        db.query(User)
        .filter(User.role == UserRole.STUDENT)
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "is_active": u.is_active,
            "onboarding_completed": u.onboarding_completed,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]
