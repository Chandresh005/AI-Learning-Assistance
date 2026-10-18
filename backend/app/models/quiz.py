import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(64), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(String(64), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)
    max_timestamp = Column(Float, nullable=False)  # Must only cover concepts taught before this timestamp
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)        # List of options: ["option A", "option B", ...]
    correct_option = Column(Integer, nullable=False) # 0-indexed correct option index
    explanation = Column(Text, nullable=False)
    source_citations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    course_id = Column(String(64), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(String(64), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(String(64), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)
    last_timestamp = Column(Float, default=0.0, nullable=False)
    watch_percentage = Column(Float, default=0.0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="progress")
