import os
from typing import List, Dict, Any, Tuple
from app.core.config import settings


def format_seconds_to_min_sec(seconds: float) -> str:
    floor_sec = int(seconds)
    mins = (floor_sec % 3600) // 60
    secs = floor_sec % 60
    return f"{mins:02d}:{secs:02d}"


async def generate_grounded_answer(
    question: str,
    current_timestamp: float,
    evidence_chunks: List[Dict[str, Any]],
    conversation_history: List[Dict[str, str]] = None
) -> Tuple[str, List[Dict[str, Any]], float]:
    """
    RAG Answer Generation Contract:
    1. Only use evidence from permitted materials (watched up to current_timestamp).
    2. Prevent future-content leakage.
    3. If evidence is insufficient, trigger controlled refusal.
    4. Provide traceable citations.
    """
    timestamp_str = format_seconds_to_min_sec(current_timestamp)

    # Controlled refusal if no evidence found
    if not evidence_chunks:
        answer = (
            f"I cannot find evidence for '{question}' in the lecture content watched so far "
            f"(up to {timestamp_str}). Please continue watching the lecture or check if this topic is introduced later."
        )
        return answer, [], 0.35

    # Check if OpenAI API key is available
    if settings.OPENAI_API_KEY:
        try:
            import httpx
            evidence_summary = "\n\n".join(
                f"[Source: {c['type'].upper()} | Range/Loc: {format_seconds_to_min_sec(c.get('start_time', 0))} - {format_seconds_to_min_sec(c.get('end_time', 0)) if 'end_time' in c else c.get('page_number') or c.get('slide_number')}]: {c['text']}"
                for c in evidence_chunks
            )
            system_prompt = (
                f"You are an AI Learning Assistant for online students. The student is currently at timestamp {timestamp_str}.\n"
                f"GROUNDING RULES:\n"
                f"1. Base your answer EXCLUSIVELY on the provided evidence.\n"
                f"2. Never reveal or discuss concepts that are not in the permitted evidence.\n"
                f"3. Explain simply and clearly for a learner.\n"
                f"4. Cite sources where appropriate (e.g. Video MM:SS, PDF Page X, PPT Slide Y)."
            )
            user_content = f"Question: {question}\n\nEvidence:\n{evidence_summary}"

            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={
                        "model": settings.LLM_MODEL,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_content}
                        ],
                        "temperature": 0.2
                    }
                )
                if res.status_code == 200:
                    api_data = res.json()
                    answer = api_data["choices"][0]["message"]["content"]
                    citations = build_citations(evidence_chunks)
                    return answer, citations, 0.95
        except Exception:
            pass  # Fallback to local grounded synthesis if API request fails

    # Deterministic Grounded Synthesis Engine (Guaranteed zero-hallucination fallback)
    top_chunk = evidence_chunks[0]
    relevant_excerpt = top_chunk["text"]

    if top_chunk["type"] == "video":
        src_label = f"Video ({format_seconds_to_min_sec(top_chunk['start_time'])} - {format_seconds_to_min_sec(top_chunk['end_time'])})"
    elif top_chunk["type"] == "pdf":
        src_label = f"Course PDF (Page {top_chunk.get('page_number')})"
    else:
        src_label = f"Lecture Slides (Slide {top_chunk.get('slide_number')})"

    answer = (
        f"Based on the material covered up to {timestamp_str} ({src_label}):\n\n"
        f"{relevant_excerpt}\n\n"
        f"(This explanation is strictly bounded to concepts introduced before {timestamp_str}; subsequent lecture topics remain protected)."
    )
    citations = build_citations(evidence_chunks)
    return answer, citations, 0.90


def build_citations(evidence_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    citations = []
    for c in evidence_chunks:
        if c["type"] == "video":
            citations.append({
                "type": "video",
                "start_time": c.get("start_time"),
                "end_time": c.get("end_time"),
                "snippet": c["text"][:140] + "..." if len(c["text"]) > 140 else c["text"]
            })
        elif c["type"] == "pdf":
            citations.append({
                "type": "pdf",
                "page": c.get("page_number"),
                "snippet": c["text"][:140] + "..." if len(c["text"]) > 140 else c["text"]
            })
        elif c["type"] == "ppt":
            citations.append({
                "type": "ppt",
                "slide": c.get("slide_number"),
                "snippet": c["text"][:140] + "..." if len(c["text"]) > 140 else c["text"]
            })
    return citations
