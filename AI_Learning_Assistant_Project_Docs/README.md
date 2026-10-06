# AI-Powered Interactive Learning Assistant — Project Documentation Pack

This package contains the planning documents to prepare **before implementation**.

## Files

1. `01_PRD_Project_Requirements_Document.md`
   - Product requirements
   - User journey
   - Functional requirements
   - MVP
   - Acceptance criteria
   - Evaluation

2. `02_TRD_Technical_Requirements_Document.md`
   - Architecture
   - Technology stack
   - Database
   - APIs
   - RAG
   - Timestamp-aware retrieval
   - Security
   - Deployment

3. `03_UI_UX_Theme_and_Icon_System.md`
   - Visual direction
   - Colors
   - Typography
   - Layout
   - UX
   - Components
   - Accessibility

4. `04_ICON_ASSET_SPEC.md`
   - Product icon direction
   - Asset list
   - Icon rules

## Step-by-step execution documents

See `steps/` for the implementation sequence:

00 Kickoff
01 Repository & Environment
02 Video Player
03 FastAPI & Database
04 Video Transcription
05 PDF/PPT Ingestion
06 Timestamp-Aware RAG
07 Grounded Answers & Citations
08 Conversation/Quiz/Progress
09 Evaluation
10 Deployment
11 Mock Interview Extension

## Recommended implementation order

Do not start with the mock interview.

First achieve:

**Video → Timestamp → Transcript → Retrieval → RAG → Citation**

Then add:

**Quiz → Progress → Evaluation → Deployment**

Finally:

**Mock Interview**
