import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.conversation import Conversation, Message
from app.schemas.ask import AskRequest, AskResponse, CitationSource
from app.services.retrieval import retrieve_permitted_evidence
from app.services.llm import generate_grounded_answer, format_seconds_to_min_sec
from app.services.jev_judge import evaluate_rag_verdict

router = APIRouter()


@router.post("/", response_model=AskResponse, summary="Ask a question with timestamp-bounded retrieval")
async def ask_question(request: AskRequest, db: AsyncSession = Depends(get_db)):
    """
    RAG endpoint enforcing strict temporal knowledge boundary [00:00 -> request.timestamp]
    and returning grounded answers with verifiable source citations and JEV audit verdict.
    """
    conversation_id = request.conversation_id or str(uuid.uuid4())

    # 1. Fetch recent conversation history for context
    conv_history = []
    if request.conversation_id:
        msg_query = (
            select(Message)
            .where(Message.conversation_id == request.conversation_id)
            .order_by(Message.created_at.desc())
            .limit(4)
        )
        msg_res = await db.execute(msg_query)
        past_msgs = msg_res.scalars().all()
        for m in reversed(past_msgs):
            conv_history.append({"role": m.role, "content": m.content})

    # 2. Retrieve permitted evidence (Video filtered strictly by current_timestamp, plus course PDF/PPT)
    evidence_chunks = await retrieve_permitted_evidence(
        course_id=request.course_id,
        video_id=request.video_id,
        current_timestamp=request.timestamp,
        query=request.question,
        db=db
    )

    # 3. Generate grounded answer and formatted citations
    answer_text, citations_list, confidence = await generate_grounded_answer(
        question=request.question,
        current_timestamp=request.timestamp,
        evidence_chunks=evidence_chunks,
        conversation_history=conv_history
    )

    # 3b. Compute inline 5-Gate JEV Verification Verdict
    jev_verdict, _ = await evaluate_rag_verdict(
        course_id=request.course_id,
        video_id=request.video_id,
        current_timestamp=request.timestamp,
        question=request.question,
        answer=answer_text,
        citations=citations_list,
        evidence_chunks=evidence_chunks,
        db=db
    )

    # 4. Save to conversation history
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

    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=request.question,
        timestamp=request.timestamp
    )
    db.add(user_msg)

    asst_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=answer_text,
        citations=citations_list
    )
    db.add(asst_msg)
    await db.commit()

    # 5. Build response model
    sources_response = [
        CitationSource(
            type=c["type"],
            start_time=c.get("start_time"),
            end_time=c.get("end_time"),
            page=c.get("page"),
            slide=c.get("slide"),
            snippet=c.get("snippet")
        )
        for c in citations_list
    ]

    time_scope_str = f"00:00 -> {format_seconds_to_min_sec(request.timestamp)}"

    return AskResponse(
        answer=answer_text,
        sources=sources_response,
        confidence=confidence,
        timestamp_scope=time_scope_str,
        conversation_id=conversation_id,
        jev_verdict=jev_verdict
    )


@router.get("/conversations/{conversation_id}", summary="Get conversation history for a session")
async def get_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    messages = res.scalars().all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "timestamp": m.timestamp,
            "citations": m.citations,
            "created_at": m.created_at.isoformat()
        }
        for m in messages
    ]

