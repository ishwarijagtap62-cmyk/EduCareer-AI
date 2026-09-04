"""
Career API — roadmap, skill gap analysis, what-if simulator.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database.base import get_db
from app.models.user import User, StudentProfile
from app.models.skills import StudentSkill
from app.core.dependencies import get_current_active_user
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/career", tags=["Career"])


class SkillGapRequest(BaseModel):
    target_role: str
    target_skills: Optional[List[str]] = None


class WhatIfRequest(BaseModel):
    skills_to_add: List[str]


class RoadmapRequest(BaseModel):
    target_role: str
    current_level: str = "beginner"


@router.post("/skill-gap")
async def analyze_skill_gap(
    data: SkillGapRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """AI-powered skill gap analysis against a target role."""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()

    current_skills = []
    if profile and profile.skills:
        current_skills = [s.name for s in profile.skills]

    prompt = f"""Perform a skill gap analysis for the following student:

Current Skills: {', '.join(current_skills) if current_skills else 'Not specified'}
Target Role: {data.target_role}
{f'Target Skills: {", ".join(data.target_skills)}' if data.target_skills else ''}

Provide a detailed skill gap analysis with:
1. Match percentage (AI-estimated)
2. Strong skills (from current skills that match the role)
3. Moderate skills (present but need improvement)
4. Missing skills (critical for the role)
5. Learning priority queue
6. Estimated timeline to be role-ready

Format the output clearly with sections and bullet points."""

    try:
        from app.agents.skill_gap_agent import SkillGapAgent
        agent = SkillGapAgent()
        result = await agent.execute(
            messages=[{"role": "user", "content": prompt}],
            student_profile=f"Skills: {', '.join(current_skills)}" if current_skills else "",
        )
        return {
            "analysis": result["content"],
            "current_skills": current_skills,
            "target_role": data.target_role,
            "label": "AI-Estimated",
        }
    except Exception as e:
        logger.error(f"Skill gap analysis error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")


@router.post("/what-if")
async def what_if_simulation(
    data: WhatIfRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """What-if career simulator — estimate impact of learning new skills."""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()

    current_skills = []
    target_role = "Software Engineer"
    if profile:
        if profile.skills:
            current_skills = [s.name for s in profile.skills]
        if profile.target_career:
            target_role = profile.target_career

    new_skills_str = ", ".join(data.skills_to_add)
    current_readiness = profile.placement_readiness_score if profile else None

    prompt = f"""Perform a What-If career simulation for this student:

Current Skills: {', '.join(current_skills) if current_skills else 'Not specified'}
Current Readiness: {f'{current_readiness}% (AI-estimated)' if current_readiness else 'Not calculated'}
Target Role: {target_role}

If the student learns: {new_skills_str}

Simulate the impact and provide:
1. Projected readiness change (current → projected, clearly labeled as AI-estimated)
2. Which specific roles become more suitable
3. How each new skill contributes
4. Recommended learning order for the new skills
5. Estimated time to acquire these skills
6. Next recommended skill after these

IMPORTANT: Clearly label all projections as "AI-estimated estimates" and note these are not guarantees."""

    try:
        result = await ai_service.chat(
            messages=[{"role": "user", "content": prompt}],
            system_prompt="You are EduCareer AI's What-If career simulator. Provide realistic, clearly-labeled AI estimates. Never guarantee outcomes.",
            temperature=0.5,
        )
        return {
            "simulation": result,
            "skills_analyzed": data.skills_to_add,
            "current_skills": current_skills,
            "target_role": target_role,
            "disclaimer": "All projections are AI-estimated and not guaranteed outcomes.",
        }
    except Exception as e:
        logger.error(f"What-if simulation error: {e}")
        raise HTTPException(status_code=500, detail="Simulation failed. Please try again.")


@router.post("/roadmap")
async def generate_roadmap(
    data: RoadmapRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Generate a personalized learning roadmap for a target role."""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()

    current_skills = []
    if profile and profile.skills:
        current_skills = [s.name for s in profile.skills]

    prompt = f"""Create a detailed learning roadmap for:

Target Role: {data.target_role}
Current Level: {data.current_level}
Current Skills: {', '.join(current_skills) if current_skills else 'Beginner level'}

Create a structured roadmap with:
1. Foundation phase (what to learn first)
2. Core skills phase
3. Advanced skills phase
4. Portfolio/Projects phase
5. Interview preparation phase

For each phase:
- List specific topics/skills in order
- Estimated time
- Key resources (types, not specific URLs)
- Milestone to mark completion

Format as a clear, motivating roadmap."""

    try:
        from app.agents.career_agent import CareerAgent
        agent = CareerAgent()
        result = await agent.execute(
            messages=[{"role": "user", "content": prompt}],
            student_profile=f"Current Skills: {', '.join(current_skills)}" if current_skills else "",
        )
        return {
            "roadmap": result["content"],
            "target_role": data.target_role,
            "current_level": data.current_level,
        }
    except Exception as e:
        logger.error(f"Roadmap generation error: {e}")
        raise HTTPException(status_code=500, detail="Roadmap generation failed.")


@router.get("/recommendations")
async def get_career_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get AI-powered career recommendations based on student profile."""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user.id
    ).first()

    if not profile:
        return {"recommendations": [], "message": "Complete your profile to get recommendations."}

    skills = [s.name for s in profile.skills] if profile.skills else []
    interests = profile.interests or []

    prompt = f"""Based on this student profile, recommend 3 career paths:

Skills: {', '.join(skills) if skills else 'Not specified'}
Interests: {', '.join(interests) if interests else 'Not specified'}
Branch: {profile.branch or 'Computer Science'}
Year: {profile.year or 'Not specified'}
Experience Level: {profile.experience_level.value if profile.experience_level else 'beginner'}

For each career path provide:
- Role name
- Match percentage (AI-estimated)
- Why it's recommended
- Required skills they already have
- Skills to acquire
- Timeline to get job-ready

Be specific and actionable. Label all scores as AI-estimated."""

    try:
        result = await ai_service.chat(
            messages=[{"role": "user", "content": prompt}],
            system_prompt="You are EduCareer AI's career recommendation engine. Be specific, realistic, and label all estimates clearly.",
        )
        return {
            "recommendations": result,
            "profile_skills": skills,
            "disclaimer": "Career match percentages are AI-estimated based on your profile.",
        }
    except Exception as e:
        logger.error(f"Career recommendations error: {e}")
        raise HTTPException(status_code=500, detail="Recommendations failed.")
