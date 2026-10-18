from app.schemas.course import CourseBase, CourseCreate, CourseResponse
from app.schemas.video import VideoBase, VideoCreate, VideoResponse
from app.schemas.resource import ResourceBase, ResourceCreate, ResourceResponse
from app.schemas.ask import AskRequest, AskResponse, CitationSource
from app.schemas.quiz import (
    QuizGenerateRequest,
    QuizQuestionResponse,
    QuizAnswerItem,
    QuizSubmitRequest,
    QuizSubmitResponse
)
from app.schemas.progress import ProgressUpdateRequest, ProgressResponse

__all__ = [
    "CourseBase",
    "CourseCreate",
    "CourseResponse",
    "VideoBase",
    "VideoCreate",
    "VideoResponse",
    "ResourceBase",
    "ResourceCreate",
    "ResourceResponse",
    "AskRequest",
    "AskResponse",
    "CitationSource",
    "QuizGenerateRequest",
    "QuizQuestionResponse",
    "QuizAnswerItem",
    "QuizSubmitRequest",
    "QuizSubmitResponse",
    "ProgressUpdateRequest",
    "ProgressResponse"
]
