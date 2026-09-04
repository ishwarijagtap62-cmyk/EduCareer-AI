"""
EduCareer AI — FastAPI application entry point.
"""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1 import api_router
from app.database.base import Base, engine

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Create tables
    try:
        import app.models  # noqa: F401 — ensures all models are registered
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ready")
        
        # Seed initial demo jobs if none exist
        from app.database.base import SessionLocal
        from app.models.jobs import Job
        seed_db = SessionLocal()
        try:
            if seed_db.query(Job).count() == 0:
                demo_jobs = [
                    Job(
                        title="Junior Full Stack Developer",
                        company="TechNova Solutions",
                        location="Remote",
                        job_type="full-time",
                        description="Exciting entry-level position building modern web applications with React, Next.js, and Node.js/Python.",
                        required_skills=["JavaScript", "React", "Python", "Git", "SQL"],
                        nice_to_have_skills=["Next.js", "Docker", "FastAPI"],
                        experience_required="0-1 years",
                        salary_range="$65,000 - $85,000",
                        is_demo=True,
                    ),
                    Job(
                        title="AI / ML Engineer Intern",
                        company="Cortex AI Labs",
                        location="San Francisco, CA (Hybrid)",
                        job_type="internship",
                        description="Work with cutting-edge LLMs, RAG pipelines, and vector databases.",
                        required_skills=["Python", "Machine Learning", "PyTorch", "Data Structures"],
                        nice_to_have_skills=["LangChain", "FastAPI", "Transformers"],
                        experience_required="Fresher / Student",
                        salary_range="$40/hour",
                        is_demo=True,
                    ),
                    Job(
                        title="Associate Cloud & DevOps Engineer",
                        company="CloudScale Networks",
                        location="Austin, TX",
                        job_type="full-time",
                        description="Automate CI/CD pipelines, manage Kubernetes clusters, and scale cloud infrastructure.",
                        required_skills=["Linux", "Docker", "AWS", "Python", "Git"],
                        nice_to_have_skills=["Kubernetes", "Terraform", "CI/CD"],
                        experience_required="0-2 years",
                        salary_range="$75,000 - $95,000",
                        is_demo=True,
                    ),
                    Job(
                        title="Junior Data Analyst",
                        company="Insight Analytics",
                        location="Remote",
                        job_type="full-time",
                        description="Analyze large datasets, create impactful business dashboards, and automate reporting.",
                        required_skills=["SQL", "Python", "Excel", "Data Visualization"],
                        nice_to_have_skills=["Power BI", "Tableau", "Pandas"],
                        experience_required="0-1 years",
                        salary_range="$60,000 - $75,000",
                        is_demo=True,
                    ),
                ]
                seed_db.add_all(demo_jobs)
                seed_db.commit()
                logger.info(f"Seeded {len(demo_jobs)} demo jobs.")
        except Exception as seed_err:
            logger.warning(f"Could not seed demo jobs: {seed_err}")
        finally:
            seed_db.close()
    except Exception as e:
        logger.warning(f"Database error: {e}")

    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)

    yield

    logger.info("Shutting down EduCareer AI")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered student copilot and career placement agent",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
       "https://edu-career-ai-six.vercel.app",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
