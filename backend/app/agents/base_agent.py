"""
Base agent class — all specialized agents extend this.
"""
from abc import ABC, abstractmethod
from typing import Optional
from app.services.ai_service import ai_service


class BaseAgent(ABC):
    name: str = "base_agent"
    display_name: str = "🤖 EduCareer AI"
    system_prompt: str = ""

    async def execute(
        self,
        messages: list[dict],
        student_profile: str = "",
        intent_data: Optional[dict] = None,
    ) -> dict:
        """
        Execute the agent with the given messages.
        Returns: {content, tools_used}
        """
        system = self._build_system_prompt(student_profile)
        tools_used = self._get_tools_used(intent_data)

        content = await ai_service.chat(
            messages=messages,
            system_prompt=system,
            temperature=0.7,
        )

        return {
            "content": content,
            "tools_used": tools_used,
        }

    def _build_system_prompt(self, student_profile: str = "") -> str:
        base = self.system_prompt
        if student_profile:
            base += f"\n\n{student_profile}"
        return base

    def _get_tools_used(self, intent_data: Optional[dict]) -> list:
        if intent_data:
            return intent_data.get("suggested_tools", [])
        return []
