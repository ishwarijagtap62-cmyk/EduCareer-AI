"""
Interview and Viva models.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Float, JSON, Enum as SAEnum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database.base import Base


class InterviewType(str, enum.Enum):
    TECHNICAL = "technical"
    HR = "hr"
    BEHAVIORAL = "behavioral"
    CODING = "coding"
    ROLE_SPECIFIC = "role_specific"


class InterviewStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    interview_type = Column(SAEnum(InterviewType), default=InterviewType.TECHNICAL)
    target_role = Column(String(255), nullable=True)
    subject = Column(String(255), nullable=True)
    status = Column(SAEnum(InterviewStatus), default=InterviewStatus.IN_PROGRESS)

    # Results
    overall_score = Column(Float, nullable=True)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    recommended_topics = Column(JSON, default=list)
    feedback = Column(Text, nullable=True)

    total_questions = Column(Integer, default=0)
    completed_questions = Column(Integer, default=0)

    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    question_number = Column(Integer, nullable=False)
    question = Column(Text, nullable=False)
    expected_answer = Column(Text, nullable=True)
    user_answer = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    topic = Column(String(255), nullable=True)
    difficulty = Column(String(50), nullable=True)
    answered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    interview = relationship("Interview", back_populates="questions")


class Viva(Base):
    __tablename__ = "vivas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=True)
    difficulty = Column(String(50), nullable=True)
    status = Column(SAEnum(InterviewStatus), default=InterviewStatus.IN_PROGRESS)

    overall_score = Column(Float, nullable=True)
    topic_scores = Column(JSON, default=dict)
    weak_topics = Column(JSON, default=list)
    feedback = Column(Text, nullable=True)

    total_questions = Column(Integer, default=0)
    completed_questions = Column(Integer, default=0)

    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="vivas")
    questions = relationship("VivaQuestion", back_populates="viva", cascade="all, delete-orphan")


class VivaQuestion(Base):
    __tablename__ = "viva_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    viva_id = Column(UUID(as_uuid=True), ForeignKey("vivas.id", ondelete="CASCADE"), nullable=False)
    question_number = Column(Integer, nullable=False)
    question = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    topic = Column(String(255), nullable=True)
    answered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    viva = relationship("Viva", back_populates="questions")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=True)
    score = Column(Float, nullable=True)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    time_taken_seconds = Column(Integer, nullable=True)
    weak_areas = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="assessments")
