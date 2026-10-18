from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class InterviewStartRequest(BaseModel):
    user_id: Optional[str] = "demo-user"
    course_id: Optional[str] = "dl-101"
    target_role: str = Field("Machine Learning Engineer", description="Target job title")
    skill_level: str = Field("Intermediate", description="Junior, Intermediate, Senior")
    resume_summary: Optional[str] = None
    job_description: Optional[str] = None


class InterviewStartResponse(BaseModel):
    session_id: str
    target_role: str
    first_question: str


class InterviewRespondRequest(BaseModel):
    session_id: str
    candidate_answer: str


class InterviewRespondResponse(BaseModel):
    next_question: str
    is_completed: bool
    intermediate_feedback: Optional[str] = None
    scorecard: Optional[Dict[str, Any]] = None
