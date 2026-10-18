import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.chunk import TranscriptChunk
from app.models.quiz import QuizQuestion, QuizAttempt


async def generate_checkpoint_quiz(
    course_id: str,
    video_id: str,
    current_timestamp: float,
    db: AsyncSession,
    count: int = 3
) -> List[Dict[str, Any]]:
    """
    Generates practice quiz questions strictly based on concepts introduced
    before the learner's current timestamp (00:00 -> current_timestamp).
    """
    # 1. Fetch permitted chunks up to current timestamp
    query = (
        select(TranscriptChunk)
        .where(
            and_(
                TranscriptChunk.video_id == video_id,
                TranscriptChunk.end_time <= current_timestamp
            )
        )
        .order_by(TranscriptChunk.start_time.asc())
    )
    result = await db.execute(query)
    chunks = result.scalars().all()

    if not chunks:
        return []

    # 2. Synthesize questions from covered concepts
    generated = []
    step = max(1, len(chunks) // count)

    for i in range(0, min(len(chunks), count * step), step):
        chunk = chunks[i]
        question_id = str(uuid.uuid4())

        # Construct question grounded in chunk text
        sample_q = QuizQuestion(
            id=question_id,
            course_id=course_id,
            video_id=video_id,
            max_timestamp=current_timestamp,
            question=f"Regarding the concept discussed around timestamp {int(chunk.start_time)}s: What is the primary characteristic mentioned?",
            options=[
                f"It states: {chunk.text[:80]}...",
                "It requires squashing the entire sequence into a static scalar without token weights.",
                "It is only applicable to uncompressed audio waveforms without embedding layers.",
                "None of the covered properties apply."
            ],
            correct_option=0,
            explanation=f"Discussed in lecture segment from {int(chunk.start_time)}s to {int(chunk.end_time)}s: {chunk.text[:120]}...",
            source_citations=[{
                "type": "video",
                "start_time": chunk.start_time,
                "end_time": chunk.end_time
            }]
        )
        db.add(sample_q)
        generated.append({
            "id": sample_q.id,
            "question": sample_q.question,
            "options": sample_q.options,
            "correct_option": sample_q.correct_option,
            "explanation": sample_q.explanation,
            "citations": sample_q.source_citations
        })

    await db.commit()
    return generated


async def grade_quiz_submission(
    user_id: str,
    course_id: str,
    video_id: str,
    answers: List[Dict[str, Any]],
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Evaluates learner answers, provides feedback explanations, and records attempt score.
    """
    score = 0
    total = len(answers)
    evaluations = []

    for ans in answers:
        q_id = ans.get("question_id")
        selected = ans.get("selected_option")

        res = await db.execute(select(QuizQuestion).where(QuizQuestion.id == q_id))
        q = res.scalar_one_or_none()
        if q:
            is_correct = (selected == q.correct_option)
            if is_correct:
                score += 1
            evaluations.append({
                "question_id": q_id,
                "is_correct": is_correct,
                "selected_option": selected,
                "correct_option": q.correct_option,
                "explanation": q.explanation,
                "citations": q.source_citations
            })

    attempt = QuizAttempt(
        user_id=user_id,
        course_id=course_id,
        video_id=video_id,
        score=score,
        total=total
    )
    db.add(attempt)
    await db.commit()

    return {
        "score": score,
        "total": total,
        "percentage": round((score / total) * 100, 1) if total > 0 else 0.0,
        "evaluations": evaluations
    }
