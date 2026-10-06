# PRD — AI-Powered Interactive Learning Assistant

## 1. Document Purpose
This Product Requirements Document (PRD) defines the product scope, learner experience, functional requirements, non-functional requirements, MVP, future extensions, and acceptance criteria for the **AI-Powered Interactive Learning Assistant** hackathon project.

## 2. Problem Statement
Traditional online learning is largely one-directional. When a learner does not understand a concept, they may leave the learning platform to search elsewhere, manually inspect resources, or wait for a mentor.

The product must keep the learner inside one intelligent learning flow:

**WATCH → PAUSE → ASK → UNDERSTAND → CONTINUE → PRACTICE → REVISE → PREPARE → INTERVIEW**

The core requirement is a context-aware assistant that understands video content, PDFs, PPTs, notes and relevant course resources.

## 3. Product Vision
Build a production-oriented AI learning platform that can understand what a learner has already watched, retrieve evidence from permitted learning resources, answer questions with grounded explanations, and provide verifiable citations.

## 4. Target Users
### Primary
- College/university students
- Online learners
- Technical learners
- Learners preparing for exams/interviews

### Secondary
- Instructors/course creators
- Training organizations
- LMS/platform administrators

## 5. Core User Journey
1. Learner opens a course.
2. Learner starts a lecture.
3. System tracks the current video timestamp.
4. Learner pauses the lecture.
5. Learner asks a question.
6. System retrieves relevant content available up to the current timestamp plus permitted supporting resources.
7. LLM generates a grounded response.
8. UI displays citations.
9. Learner can open the cited timestamp/page/slide.
10. Learner continues learning.
11. Learner can generate a summary or quiz from covered content.

## 6. Functional Requirements

### FR-01 Video Learning
- Play/pause/seek video.
- Display current timestamp and duration.
- Track learner progress.
- Preserve last watched position.

### FR-02 Timestamp-Aware Reasoning
- The current timestamp must be passed to the backend.
- Video retrieval must enforce the timestamp boundary.
- Future lecture content must not be exposed by default.
- Supporting resources may be used when permitted.

### FR-03 Multi-Resource Ingestion
Support:
- MP4/compatible educational video
- PDF
- PPT/PPTX
- TXT/Markdown notes
- Relevant code/course resources

### FR-04 Transcription
- Convert video speech to timestamped transcript.
- Preserve start/end timestamps.
- Chunk transcript without losing temporal metadata.

### FR-05 Knowledge Retrieval
- Semantic vector retrieval.
- Keyword/full-text retrieval.
- Metadata filtering.
- Timestamp filtering.
- Optional reranking.

### FR-06 AI Answering
The assistant must:
- Answer from retrieved evidence.
- Maintain conversation context.
- Explain concepts simply.
- Provide examples/analogies.
- Compare concepts.
- Summarize learning so far.
- State when evidence is insufficient.

### FR-07 Grounding and Citations
Answers should cite:
- Video timestamp ranges.
- PDF page numbers.
- PPT slide numbers.

Citations should be actionable where possible.

### FR-08 Quiz
- Generate questions from covered content.
- Avoid future video content.
- Support MCQ/short answer.
- Provide answer explanations and sources.

### FR-09 Progress
Track:
- Watch percentage.
- Last timestamp.
- Questions asked.
- Quiz attempts/scores.
- Covered topics.
- Weak areas.

### FR-10 Conversation
- Conversation/session ID.
- Follow-up questions.
- Relevant recent conversation history.
- Context should remain course/resource scoped.

## 7. AI Safety / Grounding Rules
1. Do not invent unsupported facts.
2. Do not use future video content by default.
3. Prefer retrieved learning resources over general knowledge.
4. If evidence is insufficient, explicitly state that it was not found in permitted material.
5. Citations must correspond to retrieved evidence.

## 8. MVP Scope
### Must Have
- Web application
- Video player
- Timestamp tracking
- Video transcription
- PDF/PPT ingestion
- Vector/semantic retrieval
- Timestamp-aware retrieval
- RAG answer generation
- Source citations
- Conversation memory
- Hosted deployment

### Should Have
- Hybrid retrieval
- Reranking
- Quiz generation
- Progress dashboard
- Streaming responses
- Evaluation dashboard

### Could Have
- Voice interaction
- Knowledge graph/GraphRAG
- Advanced analytics
- LMS integration

### Phase 2
- AI mock interview
- Resume/JD personalization
- Dynamic follow-up questioning
- Voice interview
- Explainable interview feedback

## 9. Non-Functional Requirements
### Accuracy
Relevant retrieval and grounded answers.

### Timestamp Integrity
Target timestamp violation rate: **0%**.

### Latency
Use retrieval and streaming techniques to keep response time low.

### Scalability
Support concurrent learners and growth beyond a pilot.

### Security
- Authentication
- Authorization
- Secure file uploads
- Secret management
- Input validation
- Rate limiting as appropriate

### Observability
- Request IDs
- Error logging
- Retrieval latency
- LLM latency
- Usage/cost metrics

## 10. Acceptance Criteria
The MVP is acceptable when:
- A learner can watch a lecture.
- Current timestamp is accurately captured.
- A question at 18:42 retrieves video content only from the allowed time range.
- PDF/PPT evidence can be retrieved.
- The answer includes valid citations.
- A question with no supporting evidence produces a controlled response.
- Follow-up questions retain appropriate context.
- Application is publicly hosted.
- Evaluation results are documented.

## 11. Evaluation
Required scenarios:
1. Question about content before current timestamp.
2. Question about content taught later.
3. Question answered by PDF.
4. Question answered by PPT.
5. Question absent from resources.
6. Multiple follow-up questions.
7. Citation verification.

Metrics:
- Retrieval accuracy
- Citation accuracy
- Hallucination rate
- Timestamp violation rate
- Response latency
- Cost per query

## 12. Hackathon Deliverables
- Hosted working application
- Source repository
- Architecture diagram
- README/setup documentation
- API documentation
- Sample dataset
- Evaluation results
- Short demo video
- Deployment instructions

## 13. Product Success
The product should demonstrate that the learner can stay inside one intelligent flow rather than switching between the lecture, search engines and documents.
