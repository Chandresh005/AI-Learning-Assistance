# AI-Powered Interactive Learning Assistant

> Context-Aware Educational Assistant with Timestamp-Enforced RAG, Video Transcription, Multi-Resource Ingestion, and Actionable Citations.

---

## 🌟 Overview

The **AI-Powered Interactive Learning Assistant** keeps the learner inside a unified, distraction-free learning loop:

$$\text{WATCH} \longrightarrow \text{PAUSE} \longrightarrow \text{ASK} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{CONTINUE}$$

### Core Invariant
When a learner pauses at **18:42**, the system strictly restricts video knowledge retrieval to `[00:00 -> 18:42]`, preventing future content spoilers or confusion. All answers are grounded in permitted course evidence (Video Transcripts, PDFs, PPTs, Notes) and accompanied by clickable timestamps and page/slide citations.

---

## 📂 Project Structure

```text
ai-learning-assistant/
├── frontend/                     # Next.js 14/15 React application (Video Player, Assistant Chat, Tabs)
├── backend/                      # FastAPI Python service (Hybrid RAG, Transcription, Auth, APIs)
├── data/                         # Local storage for educational resources
│   ├── videos/                   # MP4 / video lecture files
│   ├── pdfs/                     # Textbooks, lecture notes, reference PDFs
│   ├── ppts/                     # Lecture slide decks (.pptx)
│   ├── notes/                    # Markdown / TXT notes
│   └── transcripts/              # Timestamped Whisper transcriptions (JSON/SRT)
├── evaluation/                   # Evaluation dataset & 7-scenario verification test harness
├── architecture/                 # Architecture diagrams, specifications & design contracts
├── AI_Learning_Assistant_Project_Docs/ # Master specs, PRD, TRD, UI/UX guide & execution steps
├── docker-compose.yml            # Multi-container orchestration (App, PostgreSQL/pgvector, Redis)
├── .env.example                  # Environment configuration template
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested with v24)
- **Python**: 3.11+ (tested with 3.13)
- **Git**
- *(Optional)* Docker & Docker Compose / PostgreSQL with pgvector

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Visit API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)  
Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Documentation & Implementation Steps

Complete specifications and sequential implementation guides are located in `AI_Learning_Assistant_Project_Docs/`:
- **PRD**: [01_PRD_Project_Requirements_Document.md](file:///c:/Users/PC/Downloads/AI_Learning_Assistant_Project_Docs_COMPLETE/AI_Learning_Assistant_Project_Docs/01_PRD_Project_Requirements_Document.md)
- **TRD**: [02_TRD_Technical_Requirements_Document.md](file:///c:/Users/PC/Downloads/AI_Learning_Assistant_Project_Docs_COMPLETE/AI_Learning_Assistant_Project_Docs/02_TRD_Technical_Requirements_Document.md)
- **Master Execution Guide**: [00_MASTER_ARCHITECTURE_AND_EXECUTION.md](file:///c:/Users/PC/Downloads/AI_Learning_Assistant_Project_Docs_COMPLETE/AI_Learning_Assistant_Project_Docs/00_MASTER_ARCHITECTURE_AND_EXECUTION.md)
- **Step-by-Step Playbooks**: [AI_Learning_Assistant_Project_Docs/steps/](file:///c:/Users/PC/Downloads/AI_Learning_Assistant_Project_Docs_COMPLETE/AI_Learning_Assistant_Project_Docs/steps)
