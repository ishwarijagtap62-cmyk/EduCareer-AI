# 🎓 EduCareer AI

**One AI Agent for Your Studies, Problems, Skills & Career.**

> Learn smarter. Solve problems faster. Build skills. Get placement-ready.

## 🚀 Live Application

Access the deployed EduCareer AI application:

👉 **[Open EduCareer AI](https://edu-career-ai-six.vercel.app/)**

**Frontend:** https://edu-career-ai-six.vercel.app/

---

## 🌟 What is EduCareer AI?

EduCareer AI is a production-quality, SIH-level AI-powered student platform. It is **not** a simple chatbot or basic dashboard — it is a full multi-agent AI system where the chatbot is the central entry point to the entire platform.

### Core Architecture

```
Student
   ↓
AI Student Copilot (ChatGPT-like interface)
   ↓
AI Orchestrator (intent detection)
   ↓
Specialized Agent(s)
   ↓
Tools / Database / RAG / Groq AI
   ↓
Personalized Response + Memory Update
```

---

## 🤖 Specialized Agents

| Agent | Purpose |
|-------|---------|
| 🤖 General Agent | Everyday questions, guidance |
| 🧠 Academic Agent | DBMS, OS, CN, DSA, AI/ML, Web Dev |
| 💻 Coding Agent | Debug, explain, generate, complexity analysis |
| 📅 Study Planner Agent | Daily/weekly study plans, exam schedules |
| 📄 Resume Agent | ATS check, improvements, keywords |
| 🎯 Career Agent | Career paths, roadmaps, role guidance |
| 📊 Skill Gap Agent | Skills vs target role comparison |
| 💼 Job Matching Agent | Job match score, missing skills |
| 🎤 Interview Agent | Adaptive mock interviews, scoring |
| 📚 Viva Agent | Interactive viva, topic-wise scoring |
| 🚀 Project Agent | Project recommendations by role |

---

## 🛠 Tech Stack

**Frontend:** Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand

**Backend:** Python, FastAPI, Pydantic v2, SQLAlchemy

**Database:** PostgreSQL + ChromaDB (vector store for RAG)

**AI:** Groq API (Llama 3.3 70B Versatile)

**Auth:** JWT (access + refresh tokens), bcrypt

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Groq API key (free at https://console.groq.com)

### 1. Clone and setup

```bash
git clone <repo>
cd Student_Agent
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set:
# - DATABASE_URL (your PostgreSQL connection string)
# - GROQ_API_KEY (from console.groq.com)
# - SECRET_KEY (generate a random 32+ char string)

# Create database
# (make sure PostgreSQL is running and 'educareer' database exists)
# psql -U postgres -c "CREATE DATABASE educareer;"

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Edit .env.local — set NEXT_PUBLIC_API_URL if backend is not on localhost:8000

# Run frontend
npm run dev
```

### 4. Open in browser

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

---

## 🔑 Demo Account

Register a new account at /register, or use the demo button on the login page.

For demo purposes, the backend will create the `educareer` database tables automatically on first run.

---

## 📁 Project Structure

```
Student_Agent/
├── frontend/           # Next.js frontend
│   └── src/
│       ├── app/        # App Router pages
│       ├── components/ # React components
│       │   ├── chat/   # AI chat components
│       │   ├── dashboard/ # Dashboard widgets
│       │   ├── landing/ # Landing page
│       │   ├── layout/ # Sidebar, AppLayout
│       │   └── shared/ # ThemeProvider, etc.
│       ├── services/   # API service layer
│       ├── stores/     # Zustand state stores
│       ├── types/      # TypeScript types
│       └── lib/        # Utilities
│
├── backend/            # FastAPI backend
│   └── app/
│       ├── api/v1/     # REST API endpoints
│       ├── agents/     # Specialized AI agents
│       ├── services/   # AI service (Groq wrapper)
│       ├── rag/        # Document processor (ChromaDB)
│       ├── models/     # SQLAlchemy database models
│       ├── schemas/    # Pydantic request/response schemas
│       ├── core/       # Config, security, dependencies
│       └── database/   # DB engine and session
│
├── docs/               # Documentation
├── tests/              # Test suite
└── .env.example        # Environment variable template
```

---

## 🔒 Security Notes

- `GROQ_API_KEY` is **never** exposed to the frontend
- All AI calls go through the backend
- Passwords hashed with bcrypt
- JWT access tokens (24h) + refresh tokens (7d)
- Input validation on all endpoints
- File type and size validation for uploads

---

## 📊 Features by Phase

| Phase | Status | Features |
|-------|--------|---------|
| 1 | ✅ Complete | Architecture, DB schema, Auth, Backend API |
| 2 | ✅ Complete | Landing page, Dashboard, Sidebar, Navigation |
| 3 | ✅ Complete | Groq AI, Chat UI, Streaming, Conversation history |
| 4 | ✅ Complete | AI Orchestrator, Agent routing, 5 core agents |
| 5 | ✅ Complete | RAG: Document upload, ChromaDB, embeddings |
| 6 | 🔄 Next | Career Agent, Resume Agent, Skill Gap Agent, Roadmap |
| 7 | 🔄 Next | Job Matching, Job Dashboard, Application Tracker |
| 8 | 🔄 Next | Study Planner, Coding Practice, Interview, Viva |
| 9 | 🔄 Next | Student Memory, Placement Readiness, What-if Sim |
| 10 | 🔄 Next | Admin Dashboard, Notifications, Analytics |
| 11 | 🔄 Next | Demo data, Deployment, Polish |

---

## ⚠️ Disclaimer

All placement readiness scores are **AI-estimated** and not guarantees of placement or employment. EduCareer AI never fabricates job listings or company information.

---

*EduCareer AI — Built for SIH / Major Project demonstration of multi-agent AI systems.*
