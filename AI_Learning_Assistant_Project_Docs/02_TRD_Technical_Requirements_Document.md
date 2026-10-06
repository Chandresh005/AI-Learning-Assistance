# TRD — AI-Powered Interactive Learning Assistant

## 1. Technical Objective
Build a modular, production-oriented AI system implementing timestamp-aware RAG over video transcripts and supporting learning resources.

## 2. Reference Architecture

```text
Learner
  ↓
Next.js Web App
  ↓
FastAPI Backend
  ↓
Session / Conversation Layer
  ↓
Timestamp-Aware Hybrid Retrieval
  ├── Vector Search
  ├── Keyword Search
  ├── Metadata Filtering
  └── Timestamp Filtering
  ↓
Reranker
  ↓
LLM
  ↓
Grounded Answer + Sources
```

## 3. Recommended Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- HTML5 Video or Video.js
- Server-Sent Events (SSE) or WebSocket for streaming

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic

### Database
- PostgreSQL
- pgvector

### Cache
- Redis

### AI
- LLM provider abstraction
- Embedding model
- Hybrid retrieval
- Reranker

### Transcription
MVP:
- faster-whisper

Production option:
- AWS Transcribe

### Documents
- PyMuPDF
- python-pptx
- python-docx
- Markdown/text parsing

### Cloud
AWS-first production option:
- S3
- Bedrock
- Transcribe
- OpenSearch where useful
- RDS PostgreSQL
- ECS/Fargate
- API Gateway
- CloudWatch

### DevOps
- Docker
- Docker Compose
- GitHub Actions
- HTTPS
- Environment-based configuration

## 4. Repository Structure

```text
ai-learning-assistant/
├── frontend/
├── backend/
├── data/
│   ├── videos/
│   ├── pdfs/
│   ├── ppts/
│   ├── notes/
│   └── transcripts/
├── evaluation/
├── architecture/
├── steps/
├── docker-compose.yml
├── .env.example
└── README.md
```

## 5. Backend Modules
- auth
- courses
- videos
- resources
- ingestion
- transcription
- embeddings
- retrieval
- reranking
- RAG
- citations
- conversation
- quiz
- progress
- interview
- evaluation

## 6. Core Data Model

### users
- id
- name
- email
- password_hash
- created_at

### courses
- id
- title
- description
- created_at

### videos
- id
- course_id
- title
- storage_url
- duration
- transcript_status

### resources
- id
- course_id
- type
- title
- storage_url

### transcript_chunks
- id
- course_id
- video_id
- chunk_id
- text
- start_time
- end_time
- embedding

### document_chunks
- id
- course_id
- resource_id
- chunk_id
- text
- source_type
- page_number
- slide_number
- embedding

### conversations
- id
- user_id
- course_id
- video_id
- created_at

### messages
- id
- conversation_id
- role
- content
- timestamp
- created_at

## 7. Ingestion Pipeline

### Video
```text
Video
 ↓
Audio extraction / Transcription
 ↓
Timestamped transcript
 ↓
Semantic chunking
 ↓
Metadata
 ↓
Embeddings
 ↓
PostgreSQL + pgvector
```

### PDF
```text
PDF
 ↓
PyMuPDF
 ↓
Page-aware extraction
 ↓
Chunking
 ↓
Embeddings
 ↓
Vector store
```

### PPT
```text
PPTX
 ↓
python-pptx
 ↓
Slide-aware extraction
 ↓
Chunking
 ↓
Embeddings
 ↓
Vector store
```

## 8. Timestamp-Aware Retrieval

Input:
```json
{
  "question": "Why was this method used?",
  "video_id": "lecture-01",
  "current_timestamp": 1122
}
```

Rules:
- Video chunks must be filtered using the current timestamp.
- Future chunks are excluded by default.
- PDF/PPT resources are separately permission-filtered.
- Retrieved evidence must retain source metadata.

Recommended retrieval flow:

```text
Question
 ↓
Query normalization
 ↓
Timestamp filter
 ↓
Vector search + keyword search
 ↓
Merge
 ↓
Rerank
 ↓
Top-K evidence
```

## 9. RAG Prompt Contract

The LLM receives:
- Current timestamp
- User question
- Recent conversation
- Retrieved evidence
- Source metadata

The LLM must:
- Answer only from evidence.
- Avoid future video content.
- Say when evidence is insufficient.
- Produce source references.
- Avoid unsupported claims.

## 10. API Requirements

```text
POST /api/auth/register
POST /api/auth/login

POST /api/courses
GET  /api/courses

POST /api/videos/upload
GET  /api/videos/{id}

POST /api/resources/upload
POST /api/ingest/video
POST /api/ingest/document

POST /api/ask

POST /api/quiz/generate
POST /api/quiz/submit

GET /api/progress

POST /api/interview/start
POST /api/interview/respond
POST /api/interview/end

GET /api/health
```

## 11. Security Requirements
- JWT/OAuth authentication.
- Password hashing.
- Secure environment variables.
- CORS restrictions.
- File type and size validation.
- No secrets in Git.
- Rate limiting where appropriate.
- Authorization for course/resource access.
- Safe error messages.

## 12. Performance Requirements
- Do not send full transcripts unnecessarily.
- Use top-K retrieval.
- Use asynchronous ingestion.
- Cache safe repeated requests.
- Stream LLM output.
- Measure retrieval and generation latency.

## 13. Observability
Log:
- request ID
- course/video IDs
- retrieval count
- retrieval latency
- generation latency
- errors
- model/token usage where available

Avoid logging sensitive content unnecessarily.

## 14. Deployment
Development:
- Docker Compose

Production:
- HTTPS
- frontend hosting
- FastAPI service
- managed PostgreSQL
- object storage
- managed AI services
- monitoring

The deployment must be publicly accessible and not localhost-only.

## 15. Technical Acceptance Tests
- Timestamp boundary test.
- Future-content leakage test.
- PDF citation test.
- PPT citation test.
- No-evidence refusal test.
- Follow-up context test.
- Citation-support verification test.
- Concurrent request test.
- Upload validation test.
