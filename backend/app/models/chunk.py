import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import VectorType


class TranscriptChunk(Base):
    __tablename__ = "transcript_chunks"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(64), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(String(64), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_id = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    start_time = Column(Float, nullable=False)  # in seconds
    end_time = Column(Float, nullable=False)    # in seconds
    embedding = Column(VectorType(1536), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    course = relationship("Course", back_populates="transcript_chunks")
    video = relationship("Video", back_populates="transcript_chunks")

    # Critical compound index for enforcing temporal retrieval boundaries efficiently
    __table_args__ = (
        Index("ix_transcript_video_endtime", "video_id", "end_time"),
    )


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(64), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(64), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_id = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    source_type = Column(String(32), nullable=False)  # "pdf", "ppt", "notes"
    page_number = Column(Integer, nullable=True)     # For PDF pages
    slide_number = Column(Integer, nullable=True)    # For PPT slides
    embedding = Column(VectorType(1536), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    course = relationship("Course", back_populates="document_chunks")
    resource = relationship("Resource", back_populates="document_chunks")

    __table_args__ = (
        Index("ix_doc_course_resource", "course_id", "resource_id"),
    )
