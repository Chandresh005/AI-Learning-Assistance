from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None


class CourseCreate(CourseBase):
    id: Optional[str] = None


class CourseResponse(CourseBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
