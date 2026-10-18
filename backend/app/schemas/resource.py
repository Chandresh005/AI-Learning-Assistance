from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ResourceBase(BaseModel):
    course_id: str
    type: str  # "pdf", "ppt", "notes"
    title: str
    storage_url: str


class ResourceCreate(ResourceBase):
    id: Optional[str] = None


class ResourceResponse(ResourceBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
