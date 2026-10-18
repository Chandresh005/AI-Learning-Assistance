from typing import List, Optional, Any
from pydantic import BaseModel, Field


class QuizGenerateRequest(BaseModel):
    course_id: str
    video_id: str
    timestamp: float = Field(..., ge=0, description="Current video playback position in seconds")
    count: int = Field(3, ge=1, le=10)


class QuizQuestionResponse(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_option: Optional[int] = None
    explanation: Optional[str] = None
    citations: Optional[List[Any]] = None


class QuizAnswerItem(BaseModel):
    question_id: str
    selected_option: int


class QuizSubmitRequest(BaseModel):
    user_id: Optional[str] = "demo-user"
    course_id: str
    video_id: str
    answers: List[QuizAnswerItem]


class QuizSubmitResponse(BaseModel):
    score: int
    total: int
    percentage: float
    evaluations: List[dict]
