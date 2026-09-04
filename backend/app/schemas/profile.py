"""
Student Profile schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = None
    level: str = "beginner"
    proficiency: float = Field(0.0, ge=0.0, le=100.0)


class SkillOut(BaseModel):
    id: UUID
    name: str
    category: Optional[str]
    level: str
    status: str
    proficiency: float
    is_verified: bool

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None


class ProjectOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    technologies: Optional[str]
    github_url: Optional[str]
    live_url: Optional[str]
    is_ai_recommended: bool
    resume_value: Optional[str]

    class Config:
        from_attributes = True


class CertificationCreate(BaseModel):
    name: str
    issuer: Optional[str] = None
    credential_url: Optional[str] = None


class ProfileUpdate(BaseModel):
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = Field(None, ge=1, le=6)
    cgpa: Optional[float] = Field(None, ge=0.0, le=10.0)
    target_career: Optional[str] = None
    target_job_role: Optional[str] = None
    experience_level: Optional[str] = None
    interests: Optional[List[str]] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class ProfileOut(BaseModel):
    id: UUID
    college: Optional[str]
    degree: Optional[str]
    branch: Optional[str]
    year: Optional[int]
    cgpa: Optional[float]
    target_career: Optional[str]
    target_job_role: Optional[str]
    experience_level: str
    interests: List
    resume_score: Optional[float]
    technical_score: Optional[float]
    dsa_score: Optional[float]
    projects_score: Optional[float]
    interview_score: Optional[float]
    communication_score: Optional[float]
    placement_readiness_score: Optional[float]
    score_sources: dict
    skills: List[SkillOut] = []
    projects: List[ProjectOut] = []

    class Config:
        from_attributes = True


class PlacementScoreOut(BaseModel):
    resume_score: Optional[float]
    technical_score: Optional[float]
    dsa_score: Optional[float]
    projects_score: Optional[float]
    interview_score: Optional[float]
    communication_score: Optional[float]
    overall_score: Optional[float]
    score_sources: dict
    label: str = "AI-Estimated"
