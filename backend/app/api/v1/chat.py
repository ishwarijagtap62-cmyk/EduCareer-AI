"""
Chat API — conversations, messages, streaming responses, RAG integration.
"""
import json
import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Any

from app.database.base import get_db
from app.models.user import User, StudentProfile
from app.models.conversation import Conversation, Message, MessageRole
from app.models.memory import AgentExecution
from app.schemas.chat import (
    ConversationCreate, ConversationUpdate, ConversationOut,
    MessageOut, ChatRequest, FeedbackRequest
)
from app.core.dependencies import get_current_active_user
from app.agents.orchestrator import orchestrator
from app.services.ai_service import ai_service
from app.rag.processor import document_processor

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


def _to_uuid(val: Any) -> Optional[uuid.UUID]:
    if val is None:
        return None
    if isinstance(val, uuid.UUID):
        return val
    try:
        return uuid.UUID(str(val))
    except Exception:
        return val


# ============================================================
# Conversation CRUD
# ============================================================

@router.get("/conversations", response_model=List[ConversationOut])
async def list_conversations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id, Conversation.is_active == True)
        .order_by(Conversation.updated_at.desc())
        .limit(50)
        .all()
    )


@router.post("/conversations", response_model=ConversationOut, status_code=201)
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    conv = Conversation(
        user_id=current_user.id,
        title=data.title or "New Chat",
        mode=data.mode or "general",
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageOut])
async def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    conv = _get_conversation(conversation_id, current_user, db)
    return conv.messages


@router.patch("/conversations/{conversation_id}", response_model=ConversationOut)
async def update_conversation(
    conversation_id: str,
    data: ConversationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    conv = _get_conversation(conversation_id, current_user, db)
    if data.title is not None:
        conv.title = data.title
    db.commit()
    db.refresh(conv)
    return conv


@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    conv = _get_conversation(conversation_id, current_user, db)
    conv.is_active = False
    db.commit()


# ============================================================
# Send (non-streaming)
# ============================================================

@router.post("/send")
async def send_message(
    data: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Send a message and receive a complete (non-streaming) response."""
    conv = _get_or_create_conversation(data, current_user, db)

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        role=MessageRole.USER,
        content=data.message,
    )
    db.add(user_msg)
    db.flush()

    # Build history (exclude the just-added message)
    history = _build_history(conv.id, db, exclude_last=1)

    # RAG context
    doc_context, doc_sources = await _get_rag_context(
        data.message, str(current_user.id), data.document_ids, db
    )

    # Student profile
    profile_data = _get_profile_data(current_user, db)

    # Run orchestrator
    result = await orchestrator.process(
        user_message=data.message,
        conversation_history=history,
        user_id=str(current_user.id),
        db=db,
        mode=data.mode,
        document_context=doc_context,
        student_profile=profile_data,
        document_sources=doc_sources,
    )

    # Save AI response
    ai_msg = Message(
        conversation_id=conv.id,
        role=MessageRole.ASSISTANT,
        content=result["content"],
        agent_used=result["agent_used"],
        tools_used=result.get("tools_used", []),
        agent_steps=result.get("agent_steps", []),
        document_sources=doc_sources,
        model_used=ai_service.model,
    )
    db.add(ai_msg)

    # Update conversation metadata
    _update_conversation_meta(conv, data.message, result["agent_used"], db)

    # Log agent execution
    _log_execution(ai_msg.id, current_user.id, result, db)

    db.commit()

    return {
        "conversation_id": str(conv.id),
        "message_id": str(ai_msg.id),
        "content": result["content"],
        "agent_used": result["agent_used"],
        "agent_display_name": result.get("agent_display_name", "🤖 EduCareer AI"),
        "tools_used": result.get("tools_used", []),
        "agent_steps": result.get("agent_steps", []),
        "document_sources": doc_sources,
    }


# ============================================================
# Stream (SSE)
# ============================================================

@router.post("/stream")
async def stream_message(
    data: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Stream a response using Server-Sent Events."""
    conv = _get_or_create_conversation(data, current_user, db)

    # Save user message immediately
    user_msg = Message(
        conversation_id=conv.id,
        role=MessageRole.USER,
        content=data.message,
    )
    db.add(user_msg)
    db.flush()

    history = _build_history(conv.id, db, exclude_last=1)
    doc_context, doc_sources = await _get_rag_context(
        data.message, str(current_user.id), data.document_ids, db
    )
    profile_data = _get_profile_data(current_user, db)

    conv_id = str(conv.id)
    db.commit()

    async def event_generator():
        full_content = ""
        agent_name = "general_agent"
        agent_display = "🤖 EduCareer AI"

        try:
            async for event_type, event_data in orchestrator.process_stream(
                user_message=data.message,
                conversation_history=history,
                student_profile=profile_data,
                mode=data.mode,
                document_context=doc_context,
            ):
                if event_type == "meta":
                    agent_name = event_data["agent_used"]
                    agent_display = event_data["agent_display_name"]
                    meta = {
                        "type": "meta",
                        "agent_used": agent_name,
                        "agent_display_name": agent_display,
                        "conversation_id": conv_id,
                    }
                    yield f"data: {json.dumps(meta)}\n\n"

                elif event_type == "chunk":
                    full_content += event_data
                    yield f"data: {json.dumps({'type': 'chunk', 'content': event_data})}\n\n"

                elif event_type == "done":
                    from app.database.base import SessionLocal
                    save_db = SessionLocal()
                    try:
                        saved_conv = save_db.query(Conversation).filter(
                            Conversation.id == _to_uuid(conv_id)
                        ).first()
                        if saved_conv:
                            ai_msg = Message(
                                conversation_id=saved_conv.id,
                                role=MessageRole.ASSISTANT,
                                content=full_content,
                                agent_used=agent_name,
                                document_sources=doc_sources,
                                model_used=ai_service.model,
                            )
                            save_db.add(ai_msg)
                            _update_conversation_meta(
                                saved_conv, data.message, agent_name, save_db
                            )
                            save_db.commit()
                            msg_id = str(ai_msg.id)
                        else:
                            msg_id = "unknown"
                    except Exception as e:
                        logger.error(f"Error saving streamed message: {e}")
                        msg_id = "unknown"
                    finally:
                        save_db.close()

                    yield f"data: {json.dumps({'type': 'done', 'message_id': msg_id})}\n\n"

        except Exception as e:
            logger.error(f"Streaming error: {e}")
            error_msg = {"type": "error", "content": "Stream interrupted. Please retry."}
            yield f"data: {json.dumps(error_msg)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ============================================================
# Message actions
# ============================================================

@router.post("/messages/{message_id}/feedback")
async def submit_feedback(
    message_id: str,
    data: FeedbackRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    msg = db.query(Message).filter(Message.id == _to_uuid(message_id)).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if data.feedback not in ("thumbs_up", "thumbs_down"):
        raise HTTPException(status_code=400, detail="Invalid feedback value")
    msg.feedback = data.feedback
    db.commit()
    return {"status": "ok"}


@router.get("/search")
async def search_conversations(
    q: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Search conversation titles."""
    if not q or len(q) < 2:
        return []
    convs = (
        db.query(Conversation)
        .filter(
            Conversation.user_id == current_user.id,
            Conversation.is_active == True,
            Conversation.title.ilike(f"%{q}%"),
        )
        .order_by(Conversation.updated_at.desc())
        .limit(10)
        .all()
    )
    return [{"id": str(c.id), "title": c.title} for c in convs]


# ============================================================
# Internal helpers
# ============================================================

def _get_conversation(conv_id: Any, user: User, db: Session) -> Conversation:
    conv = db.query(Conversation).filter(
        Conversation.id == _to_uuid(conv_id),
        Conversation.user_id == user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


def _get_or_create_conversation(
    data: ChatRequest, user: User, db: Session
) -> Conversation:
    if data.conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == _to_uuid(data.conversation_id),
            Conversation.user_id == user.id,
        ).first()
        if conv:
            return conv
    conv = Conversation(
        user_id=user.id,
        title="New Chat",
        mode=data.mode or "general",
    )
    db.add(conv)
    db.flush()
    return conv


def _build_history(conv_id: Any, db: Session, exclude_last: int = 0) -> list[dict]:
    """Build message history for the AI, keeping the last 20 messages."""
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == _to_uuid(conv_id))
        .order_by(Message.created_at.asc())
        .limit(20)
        .all()
    )
    if exclude_last and messages:
        messages = messages[:-exclude_last]
    return [{"role": m.role.value if hasattr(m.role, 'value') else str(m.role), "content": m.content} for m in messages]


async def _get_rag_context(
    query: str,
    user_id: str,
    document_ids: List[str],
    db: Session,
) -> tuple[Optional[str], list]:
    """Query ChromaDB for relevant document chunks."""
    if not document_ids:
        return None, []
    try:
        chunks = await document_processor.query(
            user_id=user_id,
            query=query,
            document_ids=document_ids,
            n_results=5,
        )
        if not chunks:
            return None, []
        context = "\n\n".join(
            f"[From: {c['doc_name']}]\n{c['content']}" for c in chunks
        )
        sources = [
            {"doc_name": c["doc_name"], "doc_id": c["doc_id"], "chunk_index": c["chunk_index"]}
            for c in chunks
        ]
        return context, sources
    except Exception as e:
        logger.warning(f"RAG query failed: {e}")
        return None, []


def _get_profile_data(user: User, db: Session) -> dict:
    """Get student profile for AI personalization."""
    try:
        profile = db.query(StudentProfile).filter(
            StudentProfile.user_id == user.id
        ).first()
        if not profile:
            return {"name": user.name}
        return {
            "name": user.name,
            "target_career": profile.target_career,
            "target_job_role": profile.target_job_role,
            "skills": [s.name for s in profile.skills] if profile.skills else [],
            "branch": profile.branch,
            "year": profile.year,
            "experience_level": (
                profile.experience_level.value
                if profile.experience_level else "beginner"
            ),
        }
    except Exception:
        return {"name": user.name}


def _update_conversation_meta(
    conv: Conversation, message: str, agent_used: str, db: Session
):
    """Update conversation title and metadata."""
    conv.last_agent_used = agent_used
    msg_count = int(conv.message_count or "0") + 2
    conv.message_count = str(msg_count)
    if conv.title in ("New Chat", None, ""):
        conv.title = message[:60] + ("…" if len(message) > 60 else "")


def _log_execution(
    message_id: Any, user_id: Any, result: dict, db: Session
):
    """Log agent execution for the AI Activity panel."""
    try:
        log = AgentExecution(
            message_id=_to_uuid(message_id),
            user_id=_to_uuid(user_id),
            intent=result.get("intent", ""),
            agents_used=[result.get("agent_used", "")],
            tools_used=result.get("tools_used", []),
            steps=result.get("agent_steps", []),
            duration_ms=result.get("duration_ms"),
            success=True,
        )
        db.add(log)
    except Exception as e:
        logger.warning(f"Failed to log execution: {e}")
