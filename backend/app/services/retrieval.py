import re
import math
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.chunk import TranscriptChunk, DocumentChunk


def tokenize_text(text: str) -> set:
    """Extract lowercased alphanumeric tokens for keyword matching."""
    return set(re.findall(r"\w+", text.lower()))


def bm25_keyword_score(query_tokens: set, text: str) -> float:
    """Computes a lexical overlap score between query tokens and chunk text."""
    if not query_tokens or not text:
        return 0.0
    text_tokens = re.findall(r"\w+", text.lower())
    if not text_tokens:
        return 0.0
    overlap = sum(1 for token in text_tokens if token in query_tokens)
    return overlap / (len(text_tokens) ** 0.5 + 1.0)


async def retrieve_permitted_evidence(
    course_id: str,
    video_id: str,
    current_timestamp: float,
    query: str,
    db: AsyncSession,
    top_k_video: int = 4,
    top_k_docs: int = 3
) -> List[Dict[str, Any]]:
    """
    Core Timestamp-Aware Hybrid Retrieval Orchestrator.
    
    CRITICAL INVARIANT:
    Strictly filters video chunks where:
        video_id == :video_id AND end_time <= :current_timestamp
    This guarantees 0% future-content leakage at the database query level.
    """
    query_tokens = tokenize_text(query)

    # 1. Video Chunks Retrieval (Strictly bounded by current_timestamp)
    video_query = (
        select(TranscriptChunk)
        .where(
            and_(
                TranscriptChunk.video_id == video_id,
                TranscriptChunk.end_time <= current_timestamp  # Temporal knowledge boundary
            )
        )
    )
    video_res = await db.execute(video_query)
    permitted_video_chunks = video_res.scalars().all()

    scored_video = []
    for chunk in permitted_video_chunks:
        lex_score = bm25_keyword_score(query_tokens, chunk.text)
        if lex_score > 0:
            time_diff = max(0.0, current_timestamp - chunk.end_time)
            recency_weight = math.exp(-time_diff / 600.0)  # Decay over 10 minutes
            total_score = lex_score + (0.15 * recency_weight)
            scored_video.append({
                "type": "video",
                "chunk_id": chunk.chunk_id,
                "start_time": chunk.start_time,
                "end_time": chunk.end_time,
                "text": chunk.text,
                "score": total_score
            })

    # Sort video chunks by relevance score
    scored_video.sort(key=lambda x: x["score"], reverse=True)
    selected_video = scored_video[:top_k_video]

    # 2. Document Chunks Retrieval (PDF and PPT allowed for the course)
    doc_query = (
        select(DocumentChunk)
        .where(DocumentChunk.course_id == course_id)
    )
    doc_res = await db.execute(doc_query)
    all_doc_chunks = doc_res.scalars().all()

    scored_docs = []
    for chunk in all_doc_chunks:
        lex_score = bm25_keyword_score(query_tokens, chunk.text)
        scored_docs.append({
            "type": chunk.source_type,
            "chunk_id": chunk.chunk_id,
            "page_number": chunk.page_number,
            "slide_number": chunk.slide_number,
            "text": chunk.text,
            "score": lex_score
        })

    scored_docs.sort(key=lambda x: x["score"], reverse=True)
    selected_docs = [d for d in scored_docs[:top_k_docs] if d["score"] > 0]

    # 3. Combine and return evidence pool
    combined = selected_video + selected_docs
    return combined
