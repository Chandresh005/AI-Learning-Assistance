import time
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.jev import (
    JevSuiteSummary,
    JevProbeRequest,
    JevProbeResponse,
)
from app.services.jev_judge import evaluate_rag_verdict, run_live_jev_suite
from app.services.retrieval import retrieve_permitted_evidence
from app.services.llm import generate_grounded_answer, format_seconds_to_min_sec

router = APIRouter()


@router.get("/summary", response_model=JevSuiteSummary, summary="Get or run the JEV 7-Scenario Benchmark Suite")
async def get_jev_summary(db: AsyncSession = Depends(get_db)):
    """
    Executes and returns the live 7-scenario Judge & Evaluation Verification (JEV) benchmark report.
    """
    return await run_live_jev_suite(db)


@router.post("/run", response_model=JevSuiteSummary, summary="Trigger a fresh JEV 7-Scenario Verification Run")
async def trigger_jev_run(db: AsyncSession = Depends(get_db)):
    """
    Runs all 7 core PRD/TRD evaluation scenarios and returns detailed 5-gate JEV telemetry.
    """
    return await run_live_jev_suite(db)


@router.post("/probe", response_model=JevProbeResponse, summary="Interactive Red-Team Spoiler & Grounding Probe")
async def run_jev_probe(payload: JevProbeRequest, db: AsyncSession = Depends(get_db)):
    """
    Executes a single custom or adversarial query at a specified playhead timestamp and returns
    the RAG response alongside the 5-Gate JEV Verification Scorecard and locked future segments.
    """
    t0 = time.perf_counter()

    evidence_chunks = await retrieve_permitted_evidence(
        course_id=payload.course_id,
        video_id=payload.video_id,
        current_timestamp=payload.timestamp,
        query=payload.question,
        db=db,
    )

    answer_text, citations_list, _ = await generate_grounded_answer(
        question=payload.question,
        current_timestamp=payload.timestamp,
        evidence_chunks=evidence_chunks,
        conversation_history=[],
    )

    verdict, blocked_future_preview = await evaluate_rag_verdict(
        course_id=payload.course_id,
        video_id=payload.video_id,
        current_timestamp=payload.timestamp,
        question=payload.question,
        answer=answer_text,
        citations=citations_list,
        evidence_chunks=evidence_chunks,
        db=db,
    )

    latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)

    return JevProbeResponse(
        question=payload.question,
        timestamp=payload.timestamp,
        timestamp_formatted=format_seconds_to_min_sec(payload.timestamp),
        answer=answer_text,
        sources=citations_list,
        jev_verdict=verdict,
        blocked_future_preview=blocked_future_preview,
        latency_ms=latency_ms,
    )
