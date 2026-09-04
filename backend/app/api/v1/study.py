"""
Study API — study plans, tasks, and exam preparation.
"""
import logging
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database.base import get_db
from app.models.user import User
from app.models.study import StudyPlan, StudyTask, TaskStatus
from app.core.dependencies import get_current_active_user
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/study", tags=["Study"])


class StudyPlanRequest(BaseModel):
    subject: str
    exam_date: Optional[str] = None  # ISO date string
    available_hours_per_day: float = 2.0
    current_knowledge: str = "beginner"
    target_score: Optional[float] = None


class TaskUpdateRequest(BaseModel):
    status: str  # pending, in_progress, completed, missed


@router.get("/plans")
async def list_study_plans(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    plans = (
        db.query(StudyPlan)
        .filter(StudyPlan.user_id == current_user.id)
        .order_by(StudyPlan.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(p.id),
            "subject": p.subject,
            "exam_date": p.exam_date.isoformat() if p.exam_date else None,
            "progress": p.progress_percentage,
            "is_active": p.is_active,
            "task_count": len(p.tasks),
            "created_at": p.created_at.isoformat(),
        }
        for p in plans
    ]


@router.post("/plans")
async def create_study_plan(
    data: StudyPlanRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create an AI-generated study plan."""
    exam_date = None
    days_until_exam = 30
    if data.exam_date:
        try:
            exam_date = date.fromisoformat(data.exam_date)
            days_until_exam = max(7, (exam_date - date.today()).days)
        except ValueError:
            pass

    # Generate study plan with AI
    prompt = f"""Create a detailed study plan for:

Subject: {data.subject}
Days Available: {days_until_exam} days
Hours per Day: {data.available_hours_per_day} hours
Current Knowledge: {data.current_knowledge}
{f"Target Score: {data.target_score}%" if data.target_score else ""}

Create a day-by-day plan with:
- Specific topics for each day
- Estimated hours
- Revision days
- Mock test days
- Priority topics (important for exams)

Also provide:
1. Top 10 most important topics
2. Study tips specific to {data.subject}
3. How to use the available time efficiently"""

    try:
        from app.agents.study_planner_agent import StudyPlannerAgent
        agent = StudyPlannerAgent()
        result = await agent.execute(
            messages=[{"role": "user", "content": prompt}],
        )
        ai_plan_content = result["content"]
    except Exception as e:
        logger.error(f"Study plan AI error: {e}")
        ai_plan_content = f"Study plan for {data.subject} over {days_until_exam} days."

    # Save plan to DB
    plan = StudyPlan(
        user_id=current_user.id,
        subject=data.subject,
        exam_date=exam_date,
        start_date=date.today(),
        available_hours_per_day=data.available_hours_per_day,
        current_knowledge_level=data.current_knowledge,
        target_score=data.target_score,
        is_active=True,
    )
    db.add(plan)
    db.flush()

    # Create simple tasks from plan (first 7 days)
    task_topics = _extract_topics_from_plan(data.subject, days_until_exam)
    for i, topic in enumerate(task_topics[:min(days_until_exam, 30)]):
        task_date = date.today() + timedelta(days=i)
        db.add(StudyTask(
            plan_id=plan.id,
            title=f"Study: {topic}",
            topic=topic,
            day_number=i + 1,
            scheduled_date=task_date,
            estimated_hours=data.available_hours_per_day,
            status=TaskStatus.PENDING,
            priority=1 if i < 3 else 2,
        ))

    db.commit()

    return {
        "id": str(plan.id),
        "subject": plan.subject,
        "ai_plan": ai_plan_content,
        "days": days_until_exam,
        "exam_date": data.exam_date,
        "message": f"Study plan created for {data.subject}",
    }


@router.get("/plans/{plan_id}")
async def get_study_plan(
    plan_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == current_user.id,
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    tasks = sorted(plan.tasks, key=lambda t: (t.scheduled_date or date.max, t.day_number or 0))
    completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED)
    progress = round((completed / len(tasks)) * 100, 1) if tasks else 0

    return {
        "id": str(plan.id),
        "subject": plan.subject,
        "exam_date": plan.exam_date.isoformat() if plan.exam_date else None,
        "progress": progress,
        "is_active": plan.is_active,
        "tasks": [
            {
                "id": str(t.id),
                "title": t.title,
                "topic": t.topic,
                "day": t.day_number,
                "date": t.scheduled_date.isoformat() if t.scheduled_date else None,
                "hours": t.estimated_hours,
                "status": t.status.value,
                "priority": t.priority,
            }
            for t in tasks
        ],
    }


@router.patch("/tasks/{task_id}")
async def update_task_status(
    task_id: str,
    data: TaskUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    task = (
        db.query(StudyTask)
        .join(StudyPlan)
        .filter(StudyTask.id == task_id, StudyPlan.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        task.status = TaskStatus(data.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {data.status}")

    if data.status == "completed":
        from datetime import datetime, timezone
        task.completed_at = datetime.now(timezone.utc)
        # Recalculate plan progress
        plan = task.plan
        all_tasks = plan.tasks
        done = sum(1 for t in all_tasks if t.status == TaskStatus.COMPLETED)
        plan.progress_percentage = round((done / len(all_tasks)) * 100, 1) if all_tasks else 0

    db.commit()
    return {"id": task_id, "status": data.status}


@router.post("/exam-prep")
async def generate_exam_prep(
    subject: str,
    exam_date: Optional[str] = None,
    current_level: str = "intermediate",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Generate exam preparation material including important questions and tips."""
    prompt = f"""Generate comprehensive exam preparation material for:

Subject: {subject}
Current Level: {current_level}
{f"Exam Date: {exam_date}" if exam_date else ""}

Provide:
1. Top 20 most important exam topics
2. 10 high-probability exam questions with brief answers
3. Common mistakes to avoid
4. Last-minute revision strategy
5. Time management tips for the exam
6. Formula/concept quick reference (if applicable)"""

    try:
        from app.agents.academic_agent import AcademicAgent
        agent = AcademicAgent()
        result = await agent.execute(
            messages=[{"role": "user", "content": prompt}],
        )
        return {"content": result["content"], "subject": subject}
    except Exception as e:
        logger.error(f"Exam prep error: {e}")
        raise HTTPException(status_code=500, detail="Generation failed.")


def _extract_topics_from_plan(subject: str, days: int) -> list:
    """Generate basic topic list for a subject."""
    subject_topics = {
        "dbms": ["Introduction to DBMS", "ER Model", "Relational Model", "SQL Basics",
                 "Normalization (1NF-3NF)", "BCNF & 4NF", "Transactions", "Concurrency Control",
                 "Indexing", "Query Optimization", "Recovery", "Revision & Mock Test"],
        "os": ["Process Management", "Threading", "CPU Scheduling", "Synchronization",
               "Deadlocks", "Memory Management", "Virtual Memory", "File Systems",
               "I/O Management", "Security", "Revision"],
        "cn": ["Network Layers (OSI/TCP-IP)", "Physical Layer", "Data Link Layer",
               "Network Layer", "IP Addressing", "Transport Layer (TCP/UDP)",
               "Application Layer", "DNS & HTTP", "Security", "Revision"],
        "dsa": ["Arrays & Strings", "Linked Lists", "Stacks & Queues", "Trees",
                "Graphs (BFS/DFS)", "Dynamic Programming", "Sorting & Searching",
                "Heaps & Priority Queue", "Hashing", "Greedy Algorithms", "Revision"],
    }
    key = subject.lower().replace(" ", "")
    for k, topics in subject_topics.items():
        if k in key:
            return topics[:days]
    return [f"{subject} Topic {i+1}" for i in range(min(days, 15))]
