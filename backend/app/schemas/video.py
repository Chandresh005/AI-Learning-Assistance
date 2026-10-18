from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class VideoBase(BaseModel):
    course_id: str
    title: str
    storage_url: str
    duration: float = 0.0


class VideoCreate(VideoBase):
    id: Optional[str] = None


class VideoResponse(VideoBase):
    id: str
    transcript_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
