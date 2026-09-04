"""
Import all models so Alembic can detect them.
"""
from app.models.user import User, StudentProfile, UserRole, ExperienceLevel
from app.models.skills import StudentSkill, CareerGoal, Project, Certification
from app.models.conversation import Conversation, Message, MessageRole, ChatMode
from app.models.documents import Document, DocumentChunk
from app.models.study import StudyPlan, StudyTask, TaskStatus
from app.models.jobs import Job, SavedJob, JobApplication, ApplicationStatus
from app.models.interview import Interview, InterviewQuestion, Viva, VivaQuestion, Assessment
from app.models.memory import UserMemory, Notification, AgentExecution

__all__ = [
    "User", "StudentProfile", "UserRole", "ExperienceLevel",
    "StudentSkill", "CareerGoal", "Project", "Certification",
    "Conversation", "Message", "MessageRole", "ChatMode",
    "Document", "DocumentChunk",
    "StudyPlan", "StudyTask", "TaskStatus",
    "Job", "SavedJob", "JobApplication", "ApplicationStatus",
    "Interview", "InterviewQuestion", "Viva", "VivaQuestion", "Assessment",
    "UserMemory", "Notification", "AgentExecution",
]
