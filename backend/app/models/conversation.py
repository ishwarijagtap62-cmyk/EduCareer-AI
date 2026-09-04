"""
Conversation and Message models for the AI chatbot.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database.base import Base


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMode(str, enum.Enum):
    GENERAL = "general"
    STUDY = "study"
    CODING = "coding"
    CAREER = "career"
    RESUME = "resume"
    INTERVIEW = "interview"
    EXAM = "exam"
    DOCUMENT_QA = "document_qa"


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=True)
    mode = Column(SAEnum(ChatMode), default=ChatMode.GENERAL)
    is_active = Column(Boolean, default=True)
    message_count = Column(String(10), default="0")
    last_agent_used = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(SAEnum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)

    # Agent tracking
    agent_used = Column(String(100), nullable=True)  # "academic_agent", "coding_agent", etc.
    tools_used = Column(JSON, default=list)  # ["search_jobs", "calculate_skill_gap"]
    agent_steps = Column(JSON, default=list)  # High-level execution steps

    # RAG context
    document_sources = Column(JSON, default=list)  # [{"doc": "DBMS.pdf", "chunk": "..."}]

    # Metadata
    tokens_used = Column(String(20), nullable=True)
    model_used = Column(String(100), nullable=True)
    is_error = Column(Boolean, default=False)
    feedback = Column(String(20), nullable=True)  # "thumbs_up" / "thumbs_down"

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    conversation = relationship("Conversation", back_populates="messages")
