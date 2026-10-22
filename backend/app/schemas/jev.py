from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class JevGateResult(BaseModel):
    gate_id: int
    name: str
    passed: bool
    score: float = Field(..., description="0.0 to 100.0")
    detail: str


class JevVerificationVerdict(BaseModel):
    verdict: str = Field(
        ...,
        description="'VERIFIED', 'REFUSAL_VERIFIED', 'WARNING', or 'VIOLATION'"
    )
    overall_score: float = Field(..., description="Composite JEV score (0 to 100)")
    temporal_leakage_rate: float = Field(0.0, description="Percentage of future concepts leaked")
    groundedness_score: float = Field(100.0, description="Claim-to-evidence faithfulness score")
    citation_precision: float = Field(100.0, description="Percentage of valid source citations")
    permitted_chunks_count: int = 0
    blocked_future_chunks_count: int = 0
    gates: List[JevGateResult] = []


class JevScenarioResult(BaseModel):
    test_id: int
    category: str
    name: str
    passed: bool
    latency_ms: float
    timestamp_tested: float
    question: str
    answer_preview: str
    detail: str
    verdict: JevVerificationVerdict


class JevSuiteSummary(BaseModel):
    run_id: str
    executed_at: str
    total_scenarios: int
    passed_scenarios: int
    pass_rate_percentage: float
    timestamp_violation_rate: float
    citation_accuracy_percentage: float
    retrieval_accuracy_percentage: float
    hallucination_rate: float
    average_latency_ms: float
    results: List[JevScenarioResult]


class JevProbeRequest(BaseModel):
    course_id: str = Field(default="course-ml-100")
    video_id: str = Field(default="vid-ml-day-01")
    timestamp: float = Field(..., ge=0, description="Simulated learner playhead in seconds")
    question: str = Field(..., min_length=2, description="Adversarial or test question")


class JevProbeResponse(BaseModel):
    question: str
    timestamp: float
    timestamp_formatted: str
    answer: str
    sources: List[Dict[str, Any]] = []
    jev_verdict: JevVerificationVerdict
    blocked_future_preview: List[Dict[str, Any]] = []
    latency_ms: float
