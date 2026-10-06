# Step 06 — Timestamp-Aware RAG

## Goal
Implement the core differentiator.

## Tasks
- Accept current timestamp in `/api/ask`.
- Filter video chunks at retrieval time.
- Add vector search.
- Add keyword search.
- Merge results.
- Add reranking.
- Pass only permitted evidence to the LLM.

## Critical Test
At 18:42, a question about a concept first taught at 30:00 must not reveal that future content.

## Definition of Done
Timestamp violation rate is 0% on the controlled test dataset.
