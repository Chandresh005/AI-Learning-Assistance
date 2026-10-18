# Production Deployment Guide — AI Learning Assistant

This guide describes how to deploy the **AI-Powered Interactive Learning Assistant** in production environments.

---

## 1. Architecture Overview

```text
                       Internet / Route53
                                │
                                ▼
                        CloudFront / HTTPS
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
        Next.js Frontend (Vercel / S3)    API Gateway / ALB
                                               │
                                               ▼
                                      FastAPI on ECS Fargate
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         ▼                     ▼                     ▼
                  RDS PostgreSQL           AWS S3               AWS Bedrock /
                   + pgvector           (Media/Docs)               OpenAI
```

---

## 2. Docker & Docker Compose (Container Deployment)

To run the complete production stack on a VPS or cloud instance (e.g. AWS EC2, DigitalOcean, Hetzner):

```bash
# 1. Clone repository
git clone <repo-url>
cd AI_Learning_Assistant_Project_Docs_COMPLETE

# 2. Configure production environment
cp .env.example .env
# Fill in OPENAI_API_KEY, SECRET_KEY, and DATABASE_URL

# 3. Launch stack
docker-compose up -d --build

# 4. Verify running services
docker-compose ps
```

Health check endpoints:
- Frontend: `http://<your-host>:3000`
- Backend API Docs: `http://<your-host>:8000/docs`
- Health check: `http://<your-host>:8000/api/health`

---

## 3. AWS Production Architecture Setup

### A. Database (Amazon RDS for PostgreSQL)
1. Launch an Amazon RDS PostgreSQL instance (v15 or v16).
2. Connect to the database and enable pgvector:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Set `DATABASE_URL` in environment variables:
   ```bash
   DATABASE_URL="postgresql+asyncpg://<user>:<password>@<rds-endpoint>:5432/<dbname>"
   ```

### B. Object Storage (Amazon S3)
1. Create an S3 bucket: `ai-learning-assistant-assets-<env>`.
2. Configure CORS to allow playback streaming from the frontend domain.
3. Attach an IAM role to the ECS task with permissions: `s3:GetObject`, `s3:PutObject`.

### C. Backend (AWS ECS Fargate)
1. Push `backend/Dockerfile` to Amazon Elastic Container Registry (ECR).
2. Create an ECS Task Definition with:
   - 1-2 vCPU, 2-4 GB Memory (CPU-optimized for Whisper).
   - Environment variables from AWS Secrets Manager.
3. Place ECS service behind an Application Load Balancer (ALB) with an ACM SSL/TLS certificate.

### D. Frontend (Vercel / AWS Amplify / CloudFront)
1. Deploy `frontend/` directory to Vercel or AWS Amplify.
2. Set environment variable:
   ```bash
   NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api"
   ```
3. Attach custom domain with HTTPS enabled.

---

## 4. Smoke Test Verification

After deployment, run the verification smoke test:

```bash
python scripts/smoke_test.py --base-url https://api.yourdomain.com
```

Checks performed:
- [x] API Health & DB Connection (`GET /api/health`)
- [x] Course Listing (`GET /api/courses/`)
- [x] Video Status & Transcript Query (`GET /api/videos/`)
- [x] Temporal Boundary Filtering (`POST /api/ask/`)
- [x] Quiz Generation (`POST /api/quiz/generate`)
