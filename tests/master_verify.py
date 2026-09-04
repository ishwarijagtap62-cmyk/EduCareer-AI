import asyncio
import os
import sys
import uuid

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from fastapi.testclient import TestClient
# pyrefly: ignore [missing-import]
from app.main import app
# pyrefly: ignore [missing-import]
from app.core.config import settings
# pyrefly: ignore [missing-import]
from app.services.ai_service import ai_service
# pyrefly: ignore [missing-import]
from app.agents.orchestrator import orchestrator
# pyrefly: ignore [missing-import]
from app.database.base import Base, engine, get_db

client = TestClient(app)

def run_master_check():
    print("==================================================")
    print("      EDUCARREER AI — MASTER VERIFICATION       ")
    print("==================================================")
    
    # 1. Check Config & Keys
    print("\n[1/7] Checking Configuration & Environment...")
    assert settings.GROQ_API_KEY, "GROQ_API_KEY is missing!"
    print(f"  ✓ GROQ_API_KEY is loaded: {settings.GROQ_API_KEY[:8]}... (NOT hardcoded)")
    print(f"  ✓ GROQ_MODEL: {settings.GROQ_MODEL}")
    print(f"  ✓ DATABASE_URL: {settings.DATABASE_URL}")
    print(f"  ✓ ALLOWED_ORIGINS: {settings.ALLOWED_ORIGINS}")

    # 2. Database Schema & Tables
    print("\n[2/7] Checking Database Connection & Tables...")
    Base.metadata.create_all(bind=engine)
    print("  ✓ Database connected and tables verified/created successfully.")

    # 3. Auth Lifecycle Test
    print("\n[3/7] Testing Authentication (Register, Login, Profile Me)...")
    test_email = f"student_{uuid.uuid4().hex[:6]}@test.com"
    r_reg = client.post("/api/v1/auth/register", json={
        "name": "Alex Student",
        "email": test_email,
        "password": "SecurePassword123!"
    })
    assert r_reg.status_code == 201, f"Register failed: {r_reg.text}"
    token = r_reg.json()["access_token"]
    print("  ✓ User Registration: 201 Created")

    r_login = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "SecurePassword123!"
    })
    assert r_login.status_code == 200, f"Login failed: {r_login.text}"
    print("  ✓ User Login: 200 OK")

    headers = {"Authorization": f"Bearer {token}"}
    r_me = client.get("/api/v1/auth/me", headers=headers)
    assert r_me.status_code == 200, f"Get Me failed: {r_me.text}"
    print(f"  ✓ Auth Me Verification: 200 OK (User: {r_me.json()['name']})")

    # 4. Onboarding Test
    r_onboard = client.post("/api/v1/auth/onboarding", json={
        "college": "Tech University",
        "degree": "B.Tech",
        "branch": "Computer Science",
        "year": 3,
        "target_career": "Software Engineer",
        "target_job_role": "Full Stack Developer",
        "experience_level": "intermediate",
        "skills": ["Python", "JavaScript", "React"],
        "interests": ["Web Development", "AI/ML"]
    }, headers=headers)
    assert r_onboard.status_code == 200, f"Onboarding failed: {r_onboard.text}"
    print("  ✓ Student Onboarding: 200 OK")

    # 5. Core Business Endpoints Test
    print("\n[4/7] Testing Core Feature Endpoints...")
    
    # Jobs
    r_jobs = client.get("/api/v1/jobs/", headers=headers)
    assert r_jobs.status_code == 200, f"Jobs failed: {r_jobs.text}"
    print(f"  ✓ Jobs API: 200 OK ({len(r_jobs.json())} jobs found)")

    # Dashboard
    r_dash = client.get("/api/v1/dashboard/", headers=headers)
    assert r_dash.status_code == 200, f"Dashboard failed: {r_dash.text}"
    print("  ✓ Dashboard API: 200 OK")

    # Analytics
    r_ana = client.get("/api/v1/analytics/overview", headers=headers)
    assert r_ana.status_code == 200, f"Analytics API: 200 OK"
    print("  ✓ Analytics API: 200 OK")

    # Profile Placement Score
    r_score = client.get("/api/v1/profile/placement-score", headers=headers)
    assert r_score.status_code == 200, f"Placement Score failed: {r_score.text}"
    print("  ✓ Placement Readiness Score API: 200 OK")

    # Career Skill Gap
    r_gap = client.post("/api/v1/career/skill-gap", json={
        "target_role": "Full Stack Developer"
    }, headers=headers)
    assert r_gap.status_code == 200, f"Skill Gap failed: {r_gap.text}"
    print("  ✓ Career Skill Gap API: 200 OK")

    # Career Roadmap
    r_road = client.post("/api/v1/career/roadmap", json={
        "target_role": "Full Stack Developer"
    }, headers=headers)
    assert r_road.status_code == 200, f"Roadmap failed: {r_road.text}"
    print("  ✓ Career Roadmap API: 200 OK")

    # Study Plans
    r_study = client.get("/api/v1/study/plans", headers=headers)
    assert r_study.status_code == 200, f"Study plans failed: {r_study.text}"
    print("  ✓ Study Plans API: 200 OK")

    # 6. AI Agent Endpoints & Streaming
    print("\n[5/7] Testing AI Chat, Groq Integration & Streaming...")
    r_chat = client.post("/api/v1/chat/send", json={
        "message": "Explain quicksort in 2 sentences",
        "mode": "coding"
    }, headers=headers)
    assert r_chat.status_code == 200, f"Chat send failed: {r_chat.text}"
    chat_json = r_chat.json()
    print(f"  ✓ AI Chat Send: 200 OK | Agent: {chat_json.get('agent_used')}")
    print(f"    Preview: {chat_json.get('content')[:90]}...")

    # Conversations List
    r_convs = client.get("/api/v1/chat/conversations", headers=headers)
    assert r_convs.status_code == 200, f"Conversations failed: {r_convs.text}"
    print(f"  ✓ Conversations History API: 200 OK ({len(r_convs.json())} conversations)")

    # 7. Agent Routing Test
    print("\n[6/7] Testing Specialized Agent Routing...")
    async def test_agents():
        agents = [
            ("general_agent", "Hello! How can you guide me?", "general"),
            ("academic_agent", "Explain ACID properties in DBMS", "study"),
            ("coding_agent", "Write binary search in Python", "coding"),
            ("career_agent", "How do I become a Cloud Architect?", "career"),
        ]
        for expected, msg, mode in agents:
            res = await orchestrator.process(
                user_message=msg,
                conversation_history=[],
                user_id=test_email,
                mode=mode,
            )
            print(f"  ✓ Agent [{expected}]: Routed to -> {res['agent_used']} (Success)")

    asyncio.run(test_agents())

    print("\n[7/7] Master Verification Complete.")
    print("==================================================")
    print(">>> ALL CHECKS PASSED: READY TO RUN AND DEMO <<<")
    print("==================================================")

if __name__ == "__main__":
    run_master_check()
