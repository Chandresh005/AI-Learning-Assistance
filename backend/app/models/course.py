import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    videos = relationship("Video", back_populates="course", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="course", cascade="all, delete-orphan")
    transcript_chunks = relationship("TranscriptChunk", back_populates="course", cascade="all, delete-orphan")
    document_chunks = relationship("DocumentChunk", back_populates="course", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="course", cascade="all, delete-orphan")
