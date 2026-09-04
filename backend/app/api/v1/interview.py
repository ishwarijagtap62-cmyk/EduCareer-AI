import logging
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any

from app.database.base import get_db
from app.models.user import User
from app.models.interview import Interview, InterviewQuestion, Viva, VivaQuestion, InterviewStatus
from app.core.dependencies import get_current_active_user
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/interview", tags=["Interview"])


def _to_uuid(val: Any) -> Optional[uuid.UUID]:
    if val is None:
        return None
    if isinstance(val, uuid.UUID):
        return val
    try:
        return uuid.UUID(str(val))
    except Exception:
        return val


class StartInterviewRequest(BaseModel):
    interview_type: str = "technical"  # technical, hr, behavioral, coding, role_specific
    target_role: Optional[str] = None
    subject: Optional[str] = None


class AnswerRequest(BaseModel):
    answer: str


class StartVivaRequest(BaseModel):
    subject: str
    topic: Optional[str] = None
    difficulty: str = "medium"


@router.post("/start")
async def start_interview(
    data: StartInterviewRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Start a new mock interview session."""
    from app.models.interview import InterviewType
    try:
        interview_type = InterviewType(data.interview_type)
    except ValueError:
        interview_type = InterviewType.TECHNICAL

    interview = Interview(
        user_id=current_user.id,
        interview_type=interview_type,
        target_role=data.target_role,
        subject=data.subject,
        status=InterviewStatus.IN_PROGRESS,
    )
    db.add(interview)
    db.flush()

    # Generate first question
    prompt = f"""Start a {data.interview_type} interview{f' for {data.target_role} role' if data.target_role else ''}.

Introduce yourself briefly as the interviewer (1-2 sentences), then ask the first question.
Keep it professional and encouraging.
This is question 1 of approximately 8-10 questions."""

    from app.agents.interview_agent import InterviewAgent
    agent = InterviewAgent()
    result = await agent.execute(
        messages=[{"role": "user", "content": prompt}],
    )

    # Save first question
    q = InterviewQuestion(
        interview_id=interview.id,
        question_number=1,
        question=result["content"],
        topic=data.interview_type,
        difficulty="medium",
    )
    db.add(q)
    interview.total_questions = 1
    db.commit()

    return {
        "interview_id": str(interview.id),
        "question_id": str(q.id),
        "question_number": 1,
        "content": result["content"],
        "interview_type": data.interview_type,
        "target_role": data.target_role,
    }


@router.post("/{interview_id}/answer")
async def submit_interview_answer(
    interview_id: str,
    data: AnswerRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Submit an answer to the current interview question."""
    interview = db.query(Interview).filter(
        Interview.id == _to_uuid(interview_id),
        Interview.user_id == current_user.id,
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    if interview.status != InterviewStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Interview is not in progress")

    # Get current question (last unanswered)
    current_q = (
        db.query(InterviewQuestion)
        .filter(
            InterviewQuestion.interview_id == interview.id,
            InterviewQuestion.user_answer == None,
        )
        .order_by(InterviewQuestion.question_number.desc())
        .first()
    )

    if current_q:
        current_q.user_answer = data.answer
        current_q.answered_at = datetime.now(timezone.utc)

    # Build conversation history
    all_questions = sorted(interview.questions, key=lambda q: q.question_number)
    history = []
    for q in all_questions:
        history.append({"role": "assistant", "content": q.question})
        if q.user_answer:
            history.append({"role": "user", "content": q.user_answer})

    question_count = interview.total_questions or len(all_questions)

    # Decide: next question or wrap up
    if question_count >= 8:
        # Generate final assessment
        assessment_prompt = f"""The interview is now complete. Please provide:
1. Brief feedback on this answer: "{data.answer}"
2. Then provide the complete interview assessment with score, strengths, and areas to improve.
Format as a proper interview report."""
        wrap_up = True
    else:
        assessment_prompt = f"""The student answered: "{data.answer}"

Provide:
1. Brief feedback on their answer (2-3 sentences, encouraging but honest)
2. Then ask question {question_count + 1} of 8, which should be related or build on their answer.

Keep the interview flowing naturally."""
        wrap_up = False

    from app.agents.interview_agent import InterviewAgent
    agent = InterviewAgent()
    result = await agent.execute(
        messages=history + [{"role": "user", "content": data.answer}],
    )

    if wrap_up:
        interview.status = InterviewStatus.COMPLETED
        interview.completed_at = datetime.now(timezone.utc)
        interview.completed_questions = question_count
        db.commit()
        return {
            "interview_id": str(interview.id),
            "content": result["content"],
            "is_complete": True,
            "question_number": question_count,
        }

    # Save next question
    next_q = InterviewQuestion(
        interview_id=interview.id,
        question_number=question_count + 1,
        question=result["content"],
        topic=interview.interview_type.value if hasattr(interview.interview_type, 'value') else str(interview.interview_type),
    )
    db.add(next_q)
    interview.total_questions = question_count + 1
    db.commit()

    return {
        "interview_id": str(interview.id),
        "question_id": str(next_q.id),
        "question_number": question_count + 1,
        "content": result["content"],
        "is_complete": False,
    }


@router.get("/history")
async def get_interview_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    interviews = (
        db.query(Interview)
        .filter(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": str(i.id),
            "type": i.interview_type.value,
            "target_role": i.target_role,
            "status": i.status.value,
            "score": i.overall_score,
            "questions": i.total_questions,
            "created_at": i.created_at.isoformat(),
        }
        for i in interviews
    ]


# ---- Viva ----

@router.post("/viva/start")
async def start_viva(
    data: StartVivaRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Start a viva voce session."""
    viva = Viva(
        user_id=current_user.id,
        subject=data.subject,
        topic=data.topic,
        difficulty=data.difficulty,
        status=InterviewStatus.IN_PROGRESS,
    )
    db.add(viva)
    db.flush()

    prompt = f"""Start a viva voce for:
Subject: {data.subject}
{f"Topic: {data.topic}" if data.topic else ""}
Difficulty: {data.difficulty}

Begin with a brief welcome and ask the first viva question."""

    from app.agents.viva_agent import VivaAgent
    agent = VivaAgent()
    result = await agent.execute(messages=[{"role": "user", "content": prompt}])

    q = VivaQuestion(
        viva_id=viva.id,
        question_number=1,
        question=result["content"],
        topic=data.topic or data.subject,
    )
    db.add(q)
    viva.total_questions = 1
    db.commit()

    return {
        "viva_id": str(viva.id),
        "subject": data.subject,
        "content": result["content"],
        "question_number": 1,
    }


@router.post("/viva/{viva_id}/answer")
async def submit_viva_answer(
    viva_id: str,
    data: AnswerRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Submit an answer in a viva session."""
    viva = db.query(Viva).filter(
        Viva.id == _to_uuid(viva_id),
        Viva.user_id == current_user.id,
    ).first()
    if not viva:
        raise HTTPException(status_code=404, detail="Viva not found")

    # Save answer to last unanswered question
    current_q = (
        db.query(VivaQuestion)
        .filter(VivaQuestion.viva_id == viva.id, VivaQuestion.user_answer == None)
        .order_by(VivaQuestion.question_number.desc())
        .first()
    )
    if current_q:
        current_q.user_answer = data.answer
        current_q.answered_at = datetime.now(timezone.utc)

    history = []
    for q in sorted(viva.questions, key=lambda x: x.question_number):
        history.append({"role": "assistant", "content": q.question})
        if q.user_answer:
            history.append({"role": "user", "content": q.user_answer})

    question_count = viva.total_questions or len(viva.questions)
    wrap_up = question_count >= 10 or data.answer.lower().strip() in ("done", "finish", "end", "complete")

    if wrap_up:
        prompt_suffix = f"The student answered: '{data.answer}'\n\nProvide final viva score report."
        viva.status = InterviewStatus.COMPLETED
        viva.completed_at = datetime.now(timezone.utc)
    else:
        prompt_suffix = f"The student answered: '{data.answer}'\n\nEvaluate briefly, then ask question {question_count + 1}."

    from app.agents.viva_agent import VivaAgent
    agent = VivaAgent()
    result = await agent.execute(
        messages=history + [{"role": "user", "content": data.answer}],
    )

    if not wrap_up:
        next_q = VivaQuestion(
            viva_id=viva.id,
            question_number=question_count + 1,
            question=result["content"],
            topic=viva.topic or viva.subject,
        )
        db.add(next_q)
        viva.total_questions = question_count + 1

    db.commit()

    return {
        "viva_id": str(viva.id),
        "content": result["content"],
        "question_number": question_count + (0 if wrap_up else 1),
        "is_complete": wrap_up,
    }
