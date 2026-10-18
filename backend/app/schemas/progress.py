from typing import Optional
from pydantic import BaseModel, Field


class ProgressUpdateRequest(BaseModel):
    user_id: Optional[str] = "demo-user"
    course_id: str
    video_id: str
    last_timestamp: float = Field(..., ge=0)
    duration: float = Field(..., ge=0)


class ProgressResponse(BaseModel):
    course_id: str
    video_id: str
    last_timestamp: float
    watch_percentage: float
    completed: bool
    questions_asked_count: int
    quizzes_attempted_count: int
