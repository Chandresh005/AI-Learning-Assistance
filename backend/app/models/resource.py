import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(64), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(32), nullable=False)  # pdf, ppt, notes
    title = Column(String(255), nullable=False)
    storage_url = Column(String(1024), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    course = relationship("Course", back_populates="resources")
    document_chunks = relationship("DocumentChunk", back_populates="resource", cascade="all, delete-orphan")
