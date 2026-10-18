from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.quiz import LearningProgress, QuizAttempt
from app.models.conversation import Message, Conversation
from app.schemas.progress import ProgressUpdateRequest, ProgressResponse

router = APIRouter()


@router.post("/track", summary="Update learner playback progress")
async def track_progress(request: ProgressUpdateRequest, db: AsyncSession = Depends(get_db)):
    user_id = request.user_id or "demo-user"
    watch_pct = min(100.0, round((request.last_timestamp / request.duration) * 100, 1)) if request.duration > 0 else 0.0

    res = await db.execute(
        select(LearningProgress).where(
            LearningProgress.user_id == user_id,
            LearningProgress.video_id == request.video_id
        )
    )
    prog = res.scalar_one_or_none()
    if not prog:
        prog = LearningProgress(
            user_id=user_id,
            course_id=request.course_id,
            video_id=request.video_id,
            last_timestamp=request.last_timestamp,
            watch_percentage=watch_pct,
            completed=watch_pct >= 90.0
        )
        db.add(prog)
    else:
        if request.last_timestamp > prog.last_timestamp:
            prog.last_timestamp = request.last_timestamp
            prog.watch_percentage = max(prog.watch_percentage, watch_pct)
            if prog.watch_percentage >= 90.0:
                prog.completed = True

    await db.commit()
    return {"status": "success", "watch_percentage": prog.watch_percentage}


@router.get("/", response_model=ProgressResponse, summary="Get learner progress and analytics")
async def get_progress(course_id: str, video_id: str, user_id: str = "demo-user", db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(LearningProgress).where(
            LearningProgress.user_id == user_id,
            LearningProgress.video_id == video_id
        )
    )
    prog = res.scalar_one_or_none()

    # Count questions asked in this course/video
    conv_res = await db.execute(
        select(func.count(Message.id))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .where(Conversation.video_id == video_id, Message.role == "user")
    )
    questions_count = conv_res.scalar() or 0

    # Count quiz attempts
    quiz_res = await db.execute(
        select(func.count(QuizAttempt.id))
        .where(QuizAttempt.video_id == video_id, QuizAttempt.user_id == user_id)
    )
    quizzes_count = quiz_res.scalar() or 0

    return ProgressResponse(
        course_id=course_id,
        video_id=video_id,
        last_timestamp=prog.last_timestamp if prog else 0.0,
        watch_percentage=prog.watch_percentage if prog else 0.0,
        completed=prog.completed if prog else False,
        questions_asked_count=questions_count,
        quizzes_attempted_count=quizzes_count
    )
