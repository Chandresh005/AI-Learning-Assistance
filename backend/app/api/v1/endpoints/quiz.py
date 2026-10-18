from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.quiz import (
    QuizGenerateRequest,
    QuizQuestionResponse,
    QuizSubmitRequest,
    QuizSubmitResponse
)
from app.services.quiz import generate_checkpoint_quiz, grade_quiz_submission

router = APIRouter()


@router.post("/generate", response_model=List[QuizQuestionResponse], summary="Generate a quiz strictly from covered concepts")
async def generate_quiz(request: QuizGenerateRequest, db: AsyncSession = Depends(get_db)):
    questions = await generate_checkpoint_quiz(
        course_id=request.course_id,
        video_id=request.video_id,
        current_timestamp=request.timestamp,
        db=db,
        count=request.count
    )
    return questions


@router.post("/submit", response_model=QuizSubmitResponse, summary="Submit quiz answers and evaluate score")
async def submit_quiz(request: QuizSubmitRequest, db: AsyncSession = Depends(get_db)):
    answers_dicts = [a.model_dump() for a in request.answers]
    result = await grade_quiz_submission(
        user_id=request.user_id or "demo-user",
        course_id=request.course_id,
        video_id=request.video_id,
        answers=answers_dicts,
        db=db
    )
    return result
