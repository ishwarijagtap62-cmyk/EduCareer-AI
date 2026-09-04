from fastapi import APIRouter
from app.api.v1 import auth, chat, profile, documents, dashboard, admin, career, study, interview, jobs, analytics

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(chat.router)
api_router.include_router(profile.router)
api_router.include_router(documents.router)
api_router.include_router(dashboard.router)
api_router.include_router(admin.router)
api_router.include_router(career.router)
api_router.include_router(study.router)
api_router.include_router(interview.router)
api_router.include_router(jobs.router)
api_router.include_router(analytics.router)
