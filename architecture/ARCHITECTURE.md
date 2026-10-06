# System Architecture & Flow

## High-Level Architecture Diagram

```
                         ┌──────────────────────┐
                         │       LEARNER        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │      NEXT.JS WEB APP        │
                     │  (Intelligent Learning      │
                     │         Studio UI)          │
                     │ Video │ Chat │ Transcript   │
                     │ Quiz  │ Resources │ Progress│
                     └──────────────┬──────────────┘
                                    │ HTTP / SSE
                                    ▼
                     ┌─────────────────────────────┐
                     │       FASTAPI BACKEND       │
                     │  /api/ask, /api/quiz,       │
                     │  /api/ingest, /api/health   │
                     └──────────────┬──────────────┘
                                    │
          ┌─────────────────────────┼────────────────────────┐
          │                         │                        │
          ▼                         ▼                        ▼
   ┌─────────────┐          ┌──────────────┐          ┌────────────┐
   │ Auth / User │          │ Conversation │          │   Course   │
   │ Management  │          │   / Session  │          │ Resources  │
   └─────────────┘          └──────────────┘          └────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │    RETRIEVAL ORCHESTRATOR   │
                     └──────────────┬──────────────┘
                                    │
                      ┌─────────────┼─────────────┐
                      │             │             │
                      ▼             ▼             ▼
                Timestamp       Vector         Keyword
                  Filter        Search         Search
               (t <= t_curr)   (pgvector)      (BM25/FTS)
                      │             │             │
                      └─────────────┼─────────────┘
                                    ▼
                               RERANKER
                                    │
                                    ▼
                         TOP-K EVIDENCE CONTEXT
                                    │
                                    ▼
                               LLM / RAG
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  GROUNDED ANSWER + CITATIONS  │
                    │   Video [ts], PDF p., PPT sl. │
                    └───────────────────────────────┘
```

## Retrieval Invariant: Temporal Knowledge Boundary

The cornerstone rule of this architecture is preventing future-content leakage:

```
00:00 ───────────────────────── 18:42 │ 18:43 ──────────────────────── 60:00
          PERMITTED EVIDENCE          │            FUTURE LEAKAGE
    (Video chunks where t <= 18:42)   │           (STRICTLY BLOCKED)
```

The database query explicitly restricts video chunks:
`WHERE video_id = :video_id AND end_time <= :current_timestamp`

Supporting materials (PDF pages and PPT slides) are permitted across the lecture curriculum unless specifically restricted.
