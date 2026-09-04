"""
Core AI service layer — wraps Groq API.
All AI calls go through here. GROQ_API_KEY stays server-side only.
"""
import json
import logging
from typing import AsyncGenerator, Optional
from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        if not settings.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY not set — AI features will be unavailable")
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None
        self.model = settings.GROQ_MODEL
        self.max_tokens = settings.GROQ_MAX_TOKENS
        self.temperature = settings.GROQ_TEMPERATURE

    async def chat(
        self,
        messages: list[dict],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        json_mode: bool = False,
    ) -> str:
        """Non-streaming chat completion."""
        if not self.client:
            return "AI service is not configured. Please set GROQ_API_KEY in your environment."

        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        kwargs = {
            "model": self.model,
            "messages": full_messages,
            "temperature": temperature or self.temperature,
            "max_tokens": max_tokens or self.max_tokens,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        try:
            response = await self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise

    async def stream(
        self,
        messages: list[dict],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        """Streaming chat completion — yields text chunks."""
        if not self.client:
            yield "AI service is not configured. Please set GROQ_API_KEY in your environment."
            return

        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=full_messages,
                temperature=temperature or self.temperature,
                max_tokens=max_tokens or self.max_tokens,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
        except Exception as e:
            logger.error(f"Groq streaming error: {e}")
            yield f"\n\n[Error generating response: {str(e)}]"

    async def detect_intent(self, user_message: str, context: Optional[str] = None) -> dict:
        """
        Detect the intent of a user message and select the appropriate agent.
        Returns structured JSON with intent and agent selection.
        """
        system = """You are an intent detection system for EduCareer AI.
Analyze the student's message and return a JSON object with:
{
  "intent": "brief intent description",
  "agent": "agent_name",
  "sub_agents": ["agent1", "agent2"],  // for multi-agent workflows
  "mode": "general|study|coding|career|resume|interview|exam|document_qa",
  "requires_rag": false,
  "requires_profile": false,
  "confidence": 0.95,
  "suggested_tools": ["tool1", "tool2"]
}

Agents available:
- general_agent: greetings, general questions, unclear intent
- academic_agent: subject concepts, explanations, summaries, MCQs, exam prep
- coding_agent: code help, debugging, code generation, complexity analysis
- study_planner_agent: study plans, schedules, exam prep planning
- resume_agent: resume analysis, resume improvement, ATS
- career_agent: career guidance, career paths, recommendations
- skill_gap_agent: skill gap analysis, missing skills
- job_matching_agent: job matching, job recommendations
- interview_agent: mock interviews, interview questions
- viva_agent: viva preparation, viva questions
- project_recommendation_agent: project suggestions

For complex requests, list multiple agents in sub_agents.
"""
        prompt = f"Student message: {user_message}"
        if context:
            prompt += f"\n\nConversation context: {context}"

        try:
            result = await self.chat(
                messages=[{"role": "user", "content": prompt}],
                system_prompt=system,
                temperature=0.1,
                max_tokens=500,
                json_mode=True,
            )
            return json.loads(result)
        except Exception:
            return {
                "intent": "general question",
                "agent": "general_agent",
                "sub_agents": [],
                "mode": "general",
                "requires_rag": False,
                "requires_profile": False,
                "confidence": 0.5,
                "suggested_tools": [],
            }


# Singleton
ai_service = AIService()
