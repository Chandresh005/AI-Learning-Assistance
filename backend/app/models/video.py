import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(64), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    storage_url = Column(String(1024), nullable=False)
    duration = Column(Float, default=0.0, nullable=False)
    transcript_status = Column(String(32), default="pending", nullable=False)  # pending, processing, completed, failed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    course = relationship("Course", back_populates="videos")
    transcript_chunks = relationship("TranscriptChunk", back_populates="video", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="video", cascade="all, delete-orphan")
