"""
Chat / Conversation schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class ConversationCreate(BaseModel):
    title: Optional[str] = None
    mode: str = "general"


class ConversationUpdate(BaseModel):
    title: Optional[str] = None


class ConversationOut(BaseModel):
    id: UUID
    title: Optional[str]
    mode: str
    last_agent_used: Optional[str]
    message_count: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageOut(BaseModel):
    id: UUID
    role: str
    content: str
    agent_used: Optional[str]
    tools_used: List
    agent_steps: List
    document_sources: List
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=10000)
    mode: str = "general"
    document_ids: List[str] = []


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    content: str
    agent_used: str
    tools_used: List[str]
    agent_steps: List[dict]
    document_sources: List[dict]


class FeedbackRequest(BaseModel):
    feedback: str  # "thumbs_up" or "thumbs_down"
