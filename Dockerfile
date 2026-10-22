# ============================================================================
# Unified Full-Stack Dockerfile for Render (Frontend + FastAPI Backend + DB)
# ============================================================================

# Stage 1: Build Next.js Frontend on Debian glibc
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend

# Install dependencies cleanly for Linux x64-gnu (including Tailwind/PostCSS & TypeScript)
COPY frontend/package.json ./
RUN npm install --include=dev --no-audit --no-fund

COPY frontend/ ./
RUN rm -f package-lock.json

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV BACKEND_INTERNAL_URL="http://127.0.0.1:8000"
RUN npm run build

# Stage 2: Unified Production Runtime (Python 3.11 + Node.js 20)
FROM python:3.11-slim-bookworm AS runner
WORKDIR /app

# Install Node.js 20 & system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install lightweight production Python dependencies for FastAPI Backend
RUN pip install --no-cache-dir \
    fastapi>=0.111.0 \
    "uvicorn[standard]>=0.30.0" \
    pydantic>=2.7.0 \
    pydantic-settings>=2.3.0 \
    python-multipart>=0.0.9 \
    "sqlalchemy[asyncio]>=2.0.30" \
    greenlet>=3.0.3 \
    aiosqlite>=0.20.0 \
    "python-jose[cryptography]>=3.3.0" \
    httpx>=0.27.0 \
    python-dotenv>=1.0.1 \
    PyMuPDF>=1.24.0 \
    python-pptx>=0.6.23 \
    youtube-transcript-api>=1.2.0

# Copy Backend, Seeded Database, Data, and Evaluation Suite
COPY backend/ /app/backend/
COPY data/ /app/data/
COPY evaluation/ /app/evaluation/

# Copy Built Next.js Frontend from Stage 1
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json
COPY --from=frontend-builder /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/public /app/frontend/public
COPY --from=frontend-builder /app/frontend/next.config.mjs /app/frontend/next.config.mjs

# Create startup script that launches FastAPI on 127.0.0.1:8000 and Next.js on Render's $PORT
RUN printf '#!/bin/sh\nset -e\n\necho "Starting FastAPI backend on 127.0.0.1:8000..."\ncd /app/backend\npython -m app.db.seed_youtube_course || true\nuvicorn app.main:app --host 127.0.0.1 --port 8000 &\n\necho "Starting Next.js frontend on 0.0.0.0:${PORT:-3000}..."\ncd /app/frontend\nexec npx next start -H 0.0.0.0 -p ${PORT:-3000}\n' > /app/start.sh \
    && chmod +x /app/start.sh

ENV NODE_ENV=production
ENV BACKEND_INTERNAL_URL="http://127.0.0.1:8000"
EXPOSE 3000

CMD ["/app/start.sh"]
