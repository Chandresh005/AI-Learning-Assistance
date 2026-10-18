from typing import List, Optional
from pydantic import BaseModel, Field


class CitationSource(BaseModel):
    type: str = Field(..., description="'video', 'pdf', or 'ppt'")
    start_time: Optional[float] = Field(None, description="Start time in seconds for video citations")
    end_time: Optional[float] = Field(None, description="End time in seconds for video citations")
    page: Optional[int] = Field(None, description="Page number for PDF citations")
    slide: Optional[int] = Field(None, description="Slide number for PPT citations")
    snippet: Optional[str] = Field(None, description="Evidence text excerpt")


class AskRequest(BaseModel):
    course_id: str
    video_id: str
    timestamp: float = Field(..., ge=0, description="Current video playback position in seconds")
    question: str = Field(..., min_length=1, description="Learner's question")
    conversation_id: Optional[str] = Field(None, description="Conversation session ID for memory")


class AskResponse(BaseModel):
    answer: str
    sources: List[CitationSource] = []
    confidence: float = 1.0
    timestamp_scope: str
    conversation_id: str
