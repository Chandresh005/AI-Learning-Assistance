from fastapi import APIRouter
from app.api.v1.endpoints import health, courses, videos, resources, ask, quiz, progress

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(videos.router, prefix="/videos", tags=["Videos"])
api_router.include_router(resources.router, prefix="/resources", tags=["Resources"])
api_router.include_router(ask.router, prefix="/ask", tags=["Ask / RAG"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
api_router.include_router(progress.router, prefix="/progress", tags=["Learner Progress"])
