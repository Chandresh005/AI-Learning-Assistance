import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.database import get_db
from app.models.chunk import TranscriptChunk, DocumentChunk
from app.models.conversation import Conversation, Message
from app.schemas.ask import AskRequest, AskResponse, CitationSource

router = APIRouter()


def format_seconds(seconds: float) -> str:
    floor_sec = int(seconds)
    mins = (floor_sec % 3600) // 60
    secs = floor_sec % 60
    return f"{mins:02d}:{secs:02d}"


@router.post("/", response_model=AskResponse, summary="Ask a question with timestamp-bounded retrieval")
async def ask_question(request: AskRequest, db: AsyncSession = Depends(get_db)):
    """
    Core RAG question-answering endpoint.
    Strictly filters video evidence to [00:00 -> request.timestamp] to prevent future leakage.
    """
    conversation_id = request.conversation_id or str(uuid.uuid4())

    # 1. Enforce temporal boundary in database query
    # Only return video chunks where start_time and end_time <= current timestamp
    query = (
        select(TranscriptChunk)
        .where(
            and_(
                TranscriptChunk.video_id == request.video_id,
                TranscriptChunk.end_time <= request.timestamp
            )
        )
        .order_by(TranscriptChunk.end_time.desc())
        .limit(5)
    )
    result = await db.execute(query)
    matching_chunks = result.scalars().all()

    # 2. Also check for permitted document chunks (PDF/PPT) for the course
    doc_query = (
        select(DocumentChunk)
        .where(DocumentChunk.course_id == request.course_id)
        .limit(3)
    )
    doc_result = await db.execute(doc_query)
    doc_chunks = doc_result.scalars().all()

    # 3. Construct citations & answer
    sources = []
    evidence_texts = []

    for chunk in matching_chunks:
        evidence_texts.append(chunk.text)
        sources.append(
            CitationSource(
                type="video",
                start_time=chunk.start_time,
                end_time=chunk.end_time,
                snippet=chunk.text[:120] + "..." if len(chunk.text) > 120 else chunk.text
            )
        )

    for doc in doc_chunks:
        evidence_texts.append(doc.text)
        sources.append(
            CitationSource(
                type=doc.source_type,
                page=doc.page_number,
                slide=doc.slide_number,
                snippet=doc.text[:120] + "..." if len(doc.text) > 120 else doc.text
            )
        )

    time_scope_str = f"00:00 -> {format_seconds(request.timestamp)}"

    # If evidence found in database
    if evidence_texts:
        answer_text = (
            f"Based strictly on lecture content watched up to {format_seconds(request.timestamp)}:\n\n"
            f"{' '.join(evidence_texts[:2])}\n\n"
            f"(Retrieval strictly bounded to permitted material; future lecture concepts are excluded)."
        )
    else:
        # Controlled refusal when no permitted evidence exists up to the current timestamp
        answer_text = (
            f"I cannot find evidence for '{request.question}' in the lecture content watched so far "
            f"(up to {format_seconds(request.timestamp)}). Please continue watching or check if this topic is introduced later."
        )

    # 4. Record question and response in conversation history
    # Find or create conversation
    conv_result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = conv_result.scalar_one_or_none()
    if not conv:
        conv = Conversation(
            id=conversation_id,
            course_id=request.course_id,
            video_id=request.video_id
        )
        db.add(conv)
        await db.flush()

    # Record user message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=request.question,
        timestamp=request.timestamp
    )
    db.add(user_msg)

    # Record assistant message
    asst_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=answer_text,
        citations=[s.model_dump() for s in sources]
    )
    db.add(asst_msg)
    await db.commit()

    return AskResponse(
        answer=answer_text,
        sources=sources,
        confidence=0.92 if sources else 0.40,
        timestamp_scope=time_scope_str,
        conversation_id=conversation_id
    )
