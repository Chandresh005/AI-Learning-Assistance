import uuid
from fastapi import APIRouter, HTTPException
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewRespondRequest,
    InterviewRespondResponse
)
from app.services.interview import (
    InterviewSession,
    active_interview_sessions
)

router = APIRouter()


@router.post("/start", response_model=InterviewStartResponse, summary="Start an AI mock technical interview")
async def start_interview(request: InterviewStartRequest):
    session_id = str(uuid.uuid4())
    session = InterviewSession(
        session_id=session_id,
        target_role=request.target_role,
        skill_level=request.skill_level,
        resume_summary=request.resume_summary,
        job_description=request.job_description
    )
    first_q = session.start()
    active_interview_sessions[session_id] = session

    return InterviewStartResponse(
        session_id=session_id,
        target_role=request.target_role,
        first_question=first_q
    )


@router.post("/respond", response_model=InterviewRespondResponse, summary="Submit candidate answer and get dynamic follow-up or scorecard")
async def respond_to_question(request: InterviewRespondRequest):
    session = active_interview_sessions.get(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found or expired")

    result = session.evaluate_and_respond(request.candidate_answer)
    return InterviewRespondResponse(
        next_question=result["next_question"],
        is_completed=result["is_completed"],
        intermediate_feedback=result.get("intermediate_feedback"),
        scorecard=result.get("scorecard")
    )


@router.get("/{session_id}/scorecard", summary="Retrieve final interview scorecard")
async def get_scorecard(session_id: str):
    session = active_interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    return session.generate_scorecard()
