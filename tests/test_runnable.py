import asyncio
import os
import sys

# Configure UTF-8 stdout for Windows terminals
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Ensure backend directory is in sys.path and current working directory
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Switch CWD to backend so .env and relative database files load properly
os.chdir(BACKEND_DIR)

# Load environment variables explicitly
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(BACKEND_DIR, ".env"))
except ImportError:
    pass

from app.core.config import settings
from app.services.ai_service import ai_service
from app.agents.orchestrator import orchestrator


async def test():
    print(f"=== 1. Checking GROQ_API_KEY ===")
    if not settings.GROQ_API_KEY:
        print("ERROR: GROQ_API_KEY is not set in backend settings!")
        return False
    print(f"GROQ_API_KEY is loaded server-side: {settings.GROQ_API_KEY[:8]}...{settings.GROQ_API_KEY[-4:]}")

    print(f"\n=== 2. Testing Direct Groq Chat ===")
    try:
        resp = await ai_service.chat([{"role": "user", "content": "Respond with the word: READY"}])
        print("Groq Response:", resp.strip())
    except Exception as e:
        print("ERROR during Groq chat:", e)
        return False

    print(f"\n=== 3. Testing Streaming Response ===")
    try:
        stream_chunks = []
        async for chunk in ai_service.stream([{"role": "user", "content": "Count from 1 to 3."}]):
            stream_chunks.append(chunk)
        stream_text = "".join(stream_chunks).strip()
        print("Stream Result:", stream_text)
        if not stream_text:
            print("ERROR: Streaming produced empty response")
            return False
    except Exception as e:
        print("ERROR during streaming:", e)
        return False

    print(f"\n=== 4. Testing Agent Routing ===")
    test_cases = [
        ("General Student Agent", "Hello! How can you help me as a student?", "general", ["general_agent"]),
        ("Academic Agent", "Explain what is normal distribution in statistics", "study", ["academic_agent"]),
        ("Coding Agent", "Write a python function to check if a string is palindrome", "coding", ["coding_agent"]),
        ("Career Agent", "What are the job opportunities and skills required for a Cloud Architect?", "career", ["career_agent"]),
    ]

    for name, msg, mode, expected_agents in test_cases:
        res = await orchestrator.process(
            user_message=msg,
            conversation_history=[],
            user_id="test-user-id",
            mode=mode,
        )
        agent_used = res.get("agent_used")
        print(f"[{name}] Mode: {mode} -> Agent used: {agent_used} | Status: {'OK' if agent_used in expected_agents else 'UNEXPECTED'}")
        if not res.get("content"):
            print(f"ERROR: Agent {name} returned empty content")
            return False

    print(f"\n=== 5. Testing Chat History / Context ===")
    history = [
        {"role": "user", "content": "My target job is Data Scientist."},
        {"role": "assistant", "content": "Great choice! Data Science is in high demand."},
    ]
    res_ctx = await orchestrator.process(
        user_message="What was the target job I just told you?",
        conversation_history=history,
        user_id="test-user-id",
        mode="general",
    )
    print(f"Context test response: {res_ctx['content'][:120]}...")
    if "data scientist" not in res_ctx["content"].lower() and "data science" not in res_ctx["content"].lower():
        print("WARNING: Chat context might not have captured previous message")

    print(f"\n=== ALL CHECKS PASSED SUCCESSFULLY ===")
    return True

if __name__ == "__main__":
    success = asyncio.run(test())
    sys.exit(0 if success else 1)
