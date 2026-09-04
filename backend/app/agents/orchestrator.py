"""
AI Orchestrator — central intelligence that routes every student request to the
appropriate specialized agent(s) and returns a structured, personalized response.
"""
import logging
import time
from typing import Optional
from sqlalchemy.orm import Session

from app.services.ai_service import ai_service
from app.agents.general_agent import GeneralAgent
from app.agents.academic_agent import AcademicAgent
from app.agents.coding_agent import CodingAgent
from app.agents.career_agent import CareerAgent
from app.agents.resume_agent import ResumeAgent
from app.agents.skill_gap_agent import SkillGapAgent
from app.agents.study_planner_agent import StudyPlannerAgent
from app.agents.interview_agent import InterviewAgent
from app.agents.viva_agent import VivaAgent
from app.agents.job_matching_agent import JobMatchingAgent
from app.agents.project_recommendation_agent import ProjectRecommendationAgent

logger = logging.getLogger(__name__)

AGENT_DISPLAY_NAMES = {
    "general_agent": "🤖 EduCareer AI",
    "academic_agent": "🧠 Academic Agent",
    "coding_agent": "💻 Coding Agent",
    "career_agent": "🎯 Career Agent",
    "resume_agent": "📄 Resume Agent",
    "skill_gap_agent": "📊 Skill Gap Agent",
    "job_matching_agent": "💼 Job Matching Agent",
    "interview_agent": "🎤 Interview Agent",
    "viva_agent": "📚 Viva Agent",
    "study_planner_agent": "📅 Study Planner Agent",
    "project_recommendation_agent": "🚀 Project Agent",
}

# Map chat modes to preferred agents
MODE_AGENT_MAP = {
    "study": "academic_agent",
    "coding": "coding_agent",
    "career": "career_agent",
    "resume": "resume_agent",
    "interview": "interview_agent",
    "exam": "academic_agent",
    "document_qa": "academic_agent",
}


class Orchestrator:
    """
    Central AI Orchestrator:
    1. Receives the student's message + conversation history
    2. Detects intent and selects the right agent(s)
    3. Executes the agent with profile + RAG context
    4. Returns a structured response with full execution trace
    """

    def __init__(self):
        self.agents = {
            "general_agent": GeneralAgent(),
            "academic_agent": AcademicAgent(),
            "coding_agent": CodingAgent(),
            "career_agent": CareerAgent(),
            "resume_agent": ResumeAgent(),
            "skill_gap_agent": SkillGapAgent(),
            "study_planner_agent": StudyPlannerAgent(),
            "interview_agent": InterviewAgent(),
            "viva_agent": VivaAgent(),
            "job_matching_agent": JobMatchingAgent(),
            "project_recommendation_agent": ProjectRecommendationAgent(),
        }

    async def process(
        self,
        user_message: str,
        conversation_history: list[dict],
        user_id: str,
        db: Optional[Session] = None,
        mode: str = "general",
        document_context: Optional[str] = None,
        student_profile: Optional[dict] = None,
        document_sources: Optional[list] = None,
    ) -> dict:
        """
        Main orchestration pipeline.
        Returns: {content, agent_used, agent_display_name, tools_used, agent_steps,
                  document_sources, intent, duration_ms}
        """
        start_time = time.time()
        execution_steps = []

        def add_step(step: str, status: str = "completed"):
            execution_steps.append({"step": step, "status": status})

        add_step("Request received")

        # ------------------------------------------------------------------
        # 1. INTENT DETECTION
        # ------------------------------------------------------------------
        context_summary = ""
        if conversation_history:
            recent = conversation_history[-6:]  # last 6 messages for context
            context_summary = " | ".join(
                f"{m['role']}: {m['content'][:120]}" for m in recent
            )

        intent_data = await ai_service.detect_intent(user_message, context_summary)
        detected_intent = intent_data.get("intent", "general question")
        add_step(f"Intent detected: {detected_intent}")

        # ------------------------------------------------------------------
        # 2. AGENT SELECTION
        # ------------------------------------------------------------------
        # Mode override (user-selected mode has priority over intent)
        if mode != "general" and mode in MODE_AGENT_MAP:
            agent_name = MODE_AGENT_MAP[mode]
        else:
            agent_name = intent_data.get("agent", "general_agent")

        # Normalize unknown agents to general
        if agent_name not in self.agents:
            agent_name = "general_agent"

        display_name = AGENT_DISPLAY_NAMES.get(agent_name, "🤖 EduCareer AI")
        add_step(f"{display_name} selected")

        # ------------------------------------------------------------------
        # 3. CONTEXT ASSEMBLY
        # ------------------------------------------------------------------
        messages_for_agent = list(conversation_history)

        # Inject RAG context if available
        if document_context and document_context.strip():
            add_step("Document context retrieved")
            augmented_message = (
                f"[RELEVANT CONTENT FROM UPLOADED DOCUMENTS]\n"
                f"{document_context}\n"
                f"[END OF DOCUMENT CONTEXT]\n\n"
                f"Student question: {user_message}"
            )
            messages_for_agent.append({"role": "user", "content": augmented_message})
        else:
            messages_for_agent.append({"role": "user", "content": user_message})

        # Build profile context string
        profile_context = ""
        if student_profile and intent_data.get("requires_profile"):
            add_step("Loading student profile")
            profile_context = self._format_profile(student_profile)

        # ------------------------------------------------------------------
        # 4. AGENT EXECUTION
        # ------------------------------------------------------------------
        agent = self.agents[agent_name]
        add_step("Generating response")

        try:
            result = await agent.execute(
                messages=messages_for_agent,
                student_profile=profile_context,
                intent_data=intent_data,
            )
            add_step("Response complete")
        except Exception as e:
            logger.error(f"Agent {agent_name} execution error: {e}", exc_info=True)
            result = {
                "content": (
                    "I encountered an issue generating your response. "
                    "Please try again, or rephrase your question."
                ),
                "tools_used": [],
            }
            add_step("Error in agent execution", "error")

        duration_ms = str(int((time.time() - start_time) * 1000))

        return {
            "content": result.get("content", ""),
            "agent_used": agent_name,
            "agent_display_name": display_name,
            "tools_used": result.get("tools_used", []),
            "agent_steps": execution_steps,
            "document_sources": document_sources or [],
            "intent": detected_intent,
            "duration_ms": duration_ms,
        }

    def _format_profile(self, profile: dict) -> str:
        """Format student profile as a context string for the agent."""
        lines = ["[STUDENT PROFILE]"]
        if profile.get("name"):
            lines.append(f"Name: {profile['name']}")
        if profile.get("branch") and profile.get("year"):
            lines.append(f"Education: {profile['branch']}, Year {profile['year']}")
        if profile.get("target_career"):
            lines.append(f"Target Career: {profile['target_career']}")
        if profile.get("target_job_role"):
            lines.append(f"Target Role: {profile['target_job_role']}")
        if profile.get("skills"):
            skills_str = ", ".join(profile["skills"][:15])
            lines.append(f"Current Skills: {skills_str}")
        if profile.get("experience_level"):
            lines.append(f"Experience Level: {profile['experience_level']}")
        lines.append("[END PROFILE]")
        return "\n".join(lines)

    async def process_stream(
        self,
        user_message: str,
        conversation_history: list[dict],
        student_profile: Optional[dict] = None,
        mode: str = "general",
        document_context: Optional[str] = None,
    ):
        """
        Streaming version — yields (type, data) tuples.
        Types: "meta", "chunk", "done"
        """
        # Detect intent and agent
        context_summary = " | ".join(
            f"{m['role']}: {m['content'][:80]}"
            for m in conversation_history[-4:]
        ) if conversation_history else ""

        intent_data = await ai_service.detect_intent(user_message, context_summary)
        agent_name = intent_data.get("agent", "general_agent")

        if mode != "general" and mode in MODE_AGENT_MAP:
            agent_name = MODE_AGENT_MAP[mode]

        if agent_name not in self.agents:
            agent_name = "general_agent"

        display_name = AGENT_DISPLAY_NAMES.get(agent_name, "🤖 EduCareer AI")
        agent = self.agents[agent_name]

        # Build messages
        messages = list(conversation_history)
        if document_context:
            messages.append({
                "role": "user",
                "content": f"[CONTEXT FROM DOCUMENTS]\n{document_context}\n\nQuestion: {user_message}"
            })
        else:
            messages.append({"role": "user", "content": user_message})

        profile_context = self._format_profile(student_profile) if student_profile else ""
        system_prompt = agent._build_system_prompt(profile_context)

        yield ("meta", {
            "agent_used": agent_name,
            "agent_display_name": display_name,
            "intent": intent_data.get("intent", ""),
        })

        async for chunk in ai_service.stream(messages=messages, system_prompt=system_prompt):
            yield ("chunk", chunk)

        yield ("done", {})


# Module-level singleton
orchestrator = Orchestrator()
