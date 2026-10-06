# MASTER ARCHITECTURE & EXECUTION DOCUMENT
## AI-Powered Interactive Learning Assistant

> Single Source of Truth for Product, Technical Architecture, UI/UX, RAG, APIs, Data, Evaluation and Execution.

---

# 1. PROJECT NORTH STAR

## Product Goal

Build a production-oriented, hosted AI learning system that understands:

- Educational videos
- Timestamped video transcripts
- PDFs
- PPT/PPTX
- Notes
- Relevant code/course resources
- Learner progress
- Conversation history

The core experience is:

**WATCH → PAUSE → ASK → UNDERSTAND → CONTINUE**

The extended learning journey is:

**WATCH → PAUSE → ASK → UNDERSTAND → PRACTICE → REVISE → PREPARE → INTERVIEW**

The system must not behave as a generic chatbot. Its answers must be grounded in permitted learning resources and traceable to source evidence.

---

# 2. PRODUCT SCOPE

## 2.1 MVP

The first production milestone contains:

1. Course/lecture selection
2. Educational video player
3. Current timestamp tracking
4. Video transcription
5. Timestamped transcript storage
6. PDF/PPT ingestion
7. Unified knowledge layer
8. Timestamp-aware retrieval
9. Hybrid retrieval
10. RAG answer generation
11. Source citations
12. Conversation context
13. Quiz generation
14. Basic learner progress
15. Evaluation
16. Hosted deployment

## 2.2 Phase 2

After the learning assistant is stable:

- AI mock interview
- Resume-aware interview
- Job-description-aware interview
- Dynamic follow-up questions
- Interview scorecard
- Explainable feedback
- Optional speech-to-text/text-to-speech

---

# 3. SYSTEM PRINCIPLE

## The Most Important Rule

If the learner is currently at:

**18:42**

the default video knowledge boundary is:

**00:00 → 18:42**

The retrieval layer must prevent future video chunks from being returned.

This must be enforced in retrieval/database logic, not only through an LLM instruction.

Supporting PDFs/PPTs/resources can be retrieved when they are permitted for the course/session.

---

# 4. HIGH-LEVEL ARCHITECTURE

```text
                         ┌──────────────────────┐
                         │       LEARNER        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │      NEXT.JS WEB APP        │
                    │                             │
                    │ Video │ Chat │ Transcript   │
                    │ Quiz  │ Resources │ Progress│
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │          FASTAPI            │
                    │         API LAYER           │
                    └──────────────┬──────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
          ▼                        ▼                        ▼
   ┌────────────┐          ┌──────────────┐          ┌────────────┐
   │ Auth / User │          │ Conversation │          │   Course   │
   │ Management  │          │   / Session  │          │ Resources  │
   └────────────┘          └──────────────┘          └────────────┘
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
                 Filter         Search          Search
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
                   │ GROUNDED ANSWER + CITATIONS │
                   └───────────────────────────────┘
```

---

# 5. CONTENT INGESTION ARCHITECTURE

## 5.1 Video

```text
Video Upload
    ↓
Object Storage
    ↓
Transcription
    ↓
Timestamped Transcript
    ↓
Semantic Chunking
    ↓
Metadata
    ↓
Embeddings
    ↓
Vector / Search Database
```

Required metadata:

```text
course_id
video_id
chunk_id
text
start_time
end_time
source_type = video
```

## 5.2 PDF

```text
PDF Upload
    ↓
PDF Parser
    ↓
Page-Aware Text
    ↓
Chunking
    ↓
Embeddings
    ↓
Knowledge Store
```

Metadata:

```text
course_id
resource_id
chunk_id
text
page_number
source_type = pdf
```

## 5.3 PPT

```text
PPTX Upload
    ↓
Slide Parser
    ↓
Slide-Aware Text
    ↓
Chunking
    ↓
Embeddings
    ↓
Knowledge Store
```

Metadata:

```text
course_id
resource_id
chunk_id
text
slide_number
source_type = ppt
```

---

# 6. KNOWLEDGE LAYER

## Recommended MVP

**PostgreSQL + pgvector**

Use one database for:

- Application data
- Metadata
- Vector embeddings
- Conversation data
- Progress

## Search Strategy

Use:

```text
Vector Search
      +
Keyword Search
      +
Metadata Filtering
      +
Timestamp Filtering
      ↓
Reranking
```

An AWS/OpenSearch implementation can be introduced for production scale if required.

---

# 7. DATABASE MODEL

```text
USERS
 ├── id
 ├── name
 ├── email
 └── password_hash

COURSES
 ├── id
 ├── title
 └── description

VIDEOS
 ├── id
 ├── course_id
 ├── title
 ├── storage_url
 ├── duration
 └── transcript_status

RESOURCES
 ├── id
 ├── course_id
 ├── type
 ├── title
 └── storage_url

TRANSCRIPT_CHUNKS
 ├── id
 ├── course_id
 ├── video_id
 ├── chunk_id
 ├── text
 ├── start_time
 ├── end_time
 └── embedding

DOCUMENT_CHUNKS
 ├── id
 ├── course_id
 ├── resource_id
 ├── chunk_id
 ├── text
 ├── source_type
 ├── page_number
 ├── slide_number
 └── embedding

CONVERSATIONS
 ├── id
 ├── user_id
 ├── course_id
 └── video_id

MESSAGES
 ├── id
 ├── conversation_id
 ├── role
 ├── content
 └── created_at

QUIZ_QUESTIONS
QUIZ_ATTEMPTS
LEARNING_PROGRESS
```

---

# 8. TIMESTAMP-AWARE RAG

## Input

```json
{
  "course_id": "ml101",
  "video_id": "lecture01",
  "timestamp": 1122,
  "question": "Why did the instructor use this method?",
  "conversation_id": "abc123"
}
```

## Retrieval

```text
Question
   ↓
Normalize Query
   ↓
Current Timestamp = 1122
   ↓
Filter Video Chunks
   ↓
Vector + Keyword Search
   ↓
Supporting PDF/PPT Search
   ↓
Merge Results
   ↓
Rerank
   ↓
Top-K Evidence
   ↓
LLM
```

## Video Boundary

```text
00:00 ───────────────── 18:42 │ 18:43 ───────────── 60:00
       PERMITTED              │        FUTURE
                              │
                         BLOCKED BY DEFAULT
```

## Important

Future-content protection is a retrieval concern.

Do not depend on the model remembering a prompt such as "don't discuss future content."

---

# 9. RAG ANSWER CONTRACT

The LLM receives:

```text
Current timestamp
+
User question
+
Recent conversation
+
Retrieved evidence
+
Source metadata
```

The answer generator must:

1. Use retrieved evidence.
2. Avoid unsupported claims.
3. Avoid future video content.
4. Preserve source references.
5. Refuse/abstain when evidence is insufficient.
6. Explain concepts at learner-friendly level.

Example:

```text
Answer:
Attention allows the model to focus more strongly on relevant tokens.

Sources:
Video 14:21–16:08
PDF Page 7
PPT Slide 11
```

---

# 10. API ARCHITECTURE

## Core APIs

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

## Ask API

### Request

```json
{
  "course_id": "ml101",
  "video_id": "lecture01",
  "timestamp": 1122,
  "question": "Why did the instructor use this method?",
  "conversation_id": "abc123"
}
```

### Response

```json
{
  "answer": "Grounded answer...",
  "sources": [
    {
      "type": "video",
      "start_time": 861,
      "end_time": 920
    },
    {
      "type": "pdf",
      "page": 7
    },
    {
      "type": "ppt",
      "slide": 11
    }
  ],
  "confidence": 0.91
}
```

---

# 11. FRONTEND INFORMATION ARCHITECTURE

```text
APP
│
├── Dashboard
│
├── Courses
│   └── Course
│       ├── Lectures
│       │   └── Learning Screen
│       │       ├── Video
│       │       ├── AI Assistant
│       │       ├── Transcript
│       │       ├── Resources
│       │       ├── Quiz
│       │       └── Progress
│       │
│       └── Progress
│
└── Interview
```

## Main Learning Screen

```text
┌───────────────────────────────────────────────────┐
│ Logo | Course | Search | Progress | Profile       │
├────────────────────────────┬──────────────────────┤
│                            │                      │
│       VIDEO PLAYER         │    AI ASSISTANT      │
│                            │                      │
│                            │  Ask a question...   │
│                            │                      │
│  ▶ 18:42 / 60:00           │  Answer              │
│  ━━━━━━━━━━━━━━━━━━━       │                      │
│                            │  Sources             │
├────────────────────────────┴──────────────────────┤
│ Transcript | Resources | Quiz | Notes | Progress │
└───────────────────────────────────────────────────┘
```

---

# 12. UI/UX DESIGN SYSTEM

## Theme

**Intelligent Learning Studio**

Design goals:

- Modern
- Academic
- Trustworthy
- AI-native
- Evidence-focused
- Low visual clutter

## Color Tokens

```text
Background: #F7F9FC
Surface: #FFFFFF
Primary: #2563EB
Accent: #06B6D4
Success: #16A34A
Warning: #F59E0B
Danger: #DC2626
Text: #0F172A
Secondary Text: #475569
Border: #E2E8F0
```

## Typography

```text
Inter
JetBrains Mono for code/timestamps
```

## Icons

Use Lucide consistently.

Important icon mapping:

```text
Video       → Play / Pause
AI          → Sparkles / Bot
PDF         → FileText
PPT         → Presentation
Timestamp   → Clock3
Citation    → Link
Quiz        → ClipboardCheck
Progress    → BarChart3
Interview   → Mic / Briefcase
```

---

# 13. LEARNING FEATURES

## Quick Actions

```text
Explain simply
Give an example
Summarize what I learned
Where was this discussed?
Compare concepts
Generate quiz
```

## Progress

Track:

```text
Watch %
Last timestamp
Questions
Quiz score
Covered topics
Weak concepts
```

---

# 14. SECURITY ARCHITECTURE

```text
User
 ↓
Authentication
 ↓
JWT/session
 ↓
Authorization
 ↓
Course/resource access
 ↓
API
```

Requirements:

- Password hashing
- Secure secrets
- Input validation
- Upload validation
- Upload size limits
- CORS
- Authorization
- Rate limiting where appropriate
- Safe errors
- No secrets in repository

---

# 15. DEPLOYMENT ARCHITECTURE

## Development

```text
Next.js
FastAPI
PostgreSQL
Redis
Docker Compose
```

## AWS-Oriented Production

```text
                Internet
                   │
                   ▼
              API Gateway
                   │
             ┌─────┴─────┐
             ▼           ▼
          Frontend     FastAPI
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
         S3          PostgreSQL      Bedrock
          │           /pgvector
          │
     Video/PDF/PPT
```

Optional/scale components:

- AWS Transcribe
- OpenSearch
- ECS/Fargate
- CloudWatch

---

# 16. OBSERVABILITY

Track:

```text
Request ID
Course ID
Video ID
Retrieval latency
LLM latency
Retrieved chunks
Token/model usage
Errors
Cost/query
```

Key dashboards:

- API health
- Retrieval latency
- LLM latency
- Error rate
- Timestamp violation rate
- Query cost

---

# 17. EVALUATION ARCHITECTURE

## Test Set

```text
TEST 1
Before-timestamp question
→ Correct answer

TEST 2
Future-content question
→ No future leakage

TEST 3
PDF answer
→ Correct PDF citation

TEST 4
PPT answer
→ Correct PPT citation

TEST 5
Missing answer
→ Controlled refusal

TEST 6
Follow-up questions
→ Context maintained

TEST 7
Citation verification
→ Evidence supports answer
```

## Metrics

```text
Retrieval Accuracy
Citation Accuracy
Hallucination Rate
Timestamp Violation Rate
Response Latency
Cost Per Query
```

---

# 18. DEVELOPMENT ROADMAP

## Phase 0 — Documentation

- PRD
- TRD
- UI/UX
- Icon system
- Master architecture

## Phase 1 — Foundation

- Repository
- Next.js
- FastAPI
- PostgreSQL
- Docker
- Environment configuration

## Phase 2 — Video

- Video upload
- Video player
- Timestamp tracking
- Transcription
- Transcript storage

## Phase 3 — Resources

- PDF parser
- PPT parser
- Chunking
- Embeddings
- Vector storage

## Phase 4 — AI Core

- Timestamp-aware retrieval
- Hybrid search
- Reranking
- RAG
- Grounded response
- Citations

## Phase 5 — Learning

- Conversation memory
- Quiz
- Progress
- Weak-topic detection

## Phase 6 — Quality

- Evaluation
- Security
- Logging
- Performance
- Cost optimization

## Phase 7 — Deployment

- Docker production build
- Cloud deployment
- HTTPS
- Monitoring
- Public demo

## Phase 8 — Extension

- AI mock interview
- Dynamic follow-up
- Scorecard
- Feedback
- Optional voice

---

# 19. DEFINITION OF DONE

The core project is considered complete only when:

### Product
- Learner can watch.
- Learner can pause.
- Learner can ask.
- AI answers using learning context.
- Learner can continue.

### AI
- RAG works.
- Timestamp boundary works.
- Future leakage is prevented.
- Citations are valid.
- No-evidence questions are handled safely.

### Engineering
- API documented.
- Database implemented.
- Tests implemented.
- Errors handled.
- Secrets protected.

### Deployment
- Hosted publicly.
- HTTPS enabled.
- Monitoring available.
- Deployment instructions documented.

### Submission
- Source repository
- Architecture
- README
- API documentation
- Sample dataset
- Evaluation results
- Demo video
- Deployment instructions

---

# 20. EXECUTION RULE FOR AI CODING AGENTS

Use the step files sequentially.

```text
00_PROJECT_KICKOFF.md
        ↓
01_REPOSITORY_AND_ENVIRONMENT.md
        ↓
02_FRONTEND_VIDEO_PLAYER.md
        ↓
03_FASTAPI_DATABASE.md
        ↓
04_VIDEO_TRANSCRIPTION.md
        ↓
05_PDF_PPT_INGESTION.md
        ↓
06_TIMESTAMP_AWARE_RAG.md
        ↓
07_GROUNDED_ANSWERS_AND_CITATIONS.md
        ↓
08_CONVERSATION_QUIZ_PROGRESS.md
        ↓
09_EVALUATION.md
        ↓
10_DEPLOYMENT.md
        ↓
11_MOCK_INTERVIEW_EXTENSION.md
```

For every step:

1. Read the relevant PRD/TRD requirements.
2. Implement only the current step.
3. Run the application.
4. Run tests.
5. Fix errors.
6. Update documentation.
7. Record what changed.
8. Do not claim completion without testing.
9. Do not start the next step until the current step passes its Definition of Done.

---

# 21. FIRST DEVELOPMENT MILESTONE

The first coding milestone is intentionally small:

```text
Next.js
   ↓
Video Player
   ↓
Current Timestamp
   ↓
FastAPI
   ↓
PostgreSQL
   ↓
/api/health
```

Definition of Done:

- Frontend loads.
- Video plays.
- Timestamp updates correctly.
- FastAPI is reachable.
- PostgreSQL connects.
- `/api/health` works.
- Docker development environment works.

Only after this milestone should transcription and RAG development begin.

---

# 22. PROJECT SUCCESS STATEMENT

The final product should demonstrate:

> "An AI-native learning experience that understands what the learner has watched, answers questions from permitted course evidence, prevents future-content leakage, and shows exactly where each answer came from."

This is the core technical and product identity of the project.
