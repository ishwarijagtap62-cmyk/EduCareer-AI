"""
Study Plan and Study Task models.
"""
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, Float, Date, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database.base import Base


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    MISSED = "missed"
    RESCHEDULED = "rescheduled"


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(255), nullable=False)
    exam_date = Column(Date, nullable=True)
    start_date = Column(Date, nullable=True)
    available_hours_per_day = Column(Float, nullable=True)
    current_knowledge_level = Column(String(100), nullable=True)
    target_score = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    progress_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="study_plans")
    tasks = relationship("StudyTask", back_populates="plan", cascade="all, delete-orphan", order_by="StudyTask.scheduled_date")


class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    topic = Column(String(255), nullable=True)
    day_number = Column(Integer, nullable=True)
    scheduled_date = Column(Date, nullable=True)
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, nullable=True)
    status = Column(SAEnum(TaskStatus), default=TaskStatus.PENDING)
    priority = Column(Integer, default=1)  # 1=high, 2=medium, 3=low
    notes = Column(Text, nullable=True)
    resources = Column(Text, nullable=True)  # URLs/suggestions
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    plan = relationship("StudyPlan", back_populates="tasks")
