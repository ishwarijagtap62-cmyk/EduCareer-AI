"""
UserMemory and Notification models.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database.base import Base


class NotificationType(str, enum.Enum):
    STUDY_REMINDER = "study_reminder"
    EXAM_DEADLINE = "exam_deadline"
    JOB_DEADLINE = "job_deadline"
    INTERVIEW_PREP = "interview_prep"
    SKILL_RECOMMENDATION = "skill_recommendation"
    RESUME_UPDATE = "resume_update"
    ACHIEVEMENT = "achievement"
    GENERAL = "general"


class UserMemory(Base):
    """
    Persistent student memory — non-sensitive facts the AI remembers
    across conversations for personalization.
    """
    __tablename__ = "user_memory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Career context
    target_career = Column(String(255), nullable=True)
    target_role = Column(String(255), nullable=True)
    career_stage = Column(String(100), nullable=True)

    # Learning context
    current_subjects = Column(JSON, default=list)
    completed_topics = Column(JSON, default=list)
    weak_subjects = Column(JSON, default=list)
    strong_subjects = Column(JSON, default=list)

    # Performance memory
    last_interview_score = Column(String(20), nullable=True)
    last_viva_score = Column(String(20), nullable=True)
    coding_weak_topics = Column(JSON, default=list)

    # Preferences
    preferred_explanation_style = Column(String(100), nullable=True)  # simple/detailed/exam/interview
    preferred_language = Column(String(50), default="english")

    # Interaction memory
    total_conversations = Column(String(20), default="0")
    frequently_asked_topics = Column(JSON, default=list)
    last_active_agent = Column(String(100), nullable=True)

    # Free-form memory (key-value pairs from AI)
    memory_facts = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="user_memory")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(SAEnum(NotificationType), default=NotificationType.GENERAL)
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    action_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")


class AgentExecution(Base):
    """
    Tracks agent execution steps for the AI Activity panel.
    """
    __tablename__ = "agent_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    intent = Column(String(255), nullable=True)
    agents_used = Column(JSON, default=list)
    tools_used = Column(JSON, default=list)
    steps = Column(JSON, default=list)  # [{step: "Intent detected", status: "completed"}]
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    duration_ms = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
