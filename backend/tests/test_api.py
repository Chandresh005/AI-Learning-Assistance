import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.chunk import TranscriptChunk
import asyncio


def test_courses_api():
    with TestClient(app) as client:
        # Create course
        res = client.post("/api/courses/", json={
            "id": "dl-101",
            "title": "Deep Learning & NLP Mastery",
            "description": "Comprehensive course on transformer architectures"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == "dl-101"
        assert data["title"] == "Deep Learning & NLP Mastery"

        # List courses
        list_res = client.get("/api/courses/")
        assert list_res.status_code == 200
        courses = list_res.json()
        assert any(c["id"] == "dl-101" for c in courses)


def test_videos_api():
    with TestClient(app) as client:
        # Create video
        res = client.post("/api/videos/", json={
            "id": "lec-01",
            "course_id": "dl-101",
            "title": "Lecture 01: Attention Mechanisms",
            "storage_url": "https://example.com/lec01.mp4",
            "duration": 3600.0
        })
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == "lec-01"
        assert data["transcript_status"] == "pending"


def test_timestamp_boundary_retrieval():
    """
    Core test:
    Given a transcript chunk between [60s, 120s]:
    - Asking at timestamp 30s MUST NOT return the chunk (future content).
    - Asking at timestamp 150s MUST return the chunk (permitted evidence).
    """
    # Seed a transcript chunk into the database
    async def seed_chunk():
        async with AsyncSessionLocal() as session:
            chunk = TranscriptChunk(
                course_id="dl-101",
                video_id="lec-01",
                chunk_id=1,
                text="In traditional RNNs, information is squashed into a fixed vector.",
                start_time=60.0,
                end_time=120.0
            )
            session.add(chunk)
            await session.commit()

    asyncio.run(seed_chunk())

    with TestClient(app) as client:
        # 1. Query at t=30s (BEFORE chunk ends at 120s) -> Should be excluded!
        res_early = client.post("/api/ask/", json={
            "course_id": "dl-101",
            "video_id": "lec-01",
            "timestamp": 30.0,
            "question": "What happens in traditional RNNs?"
        })
        assert res_early.status_code == 200
        early_data = res_early.json()
        # No video sources should be returned
        assert len([s for s in early_data["sources"] if s["type"] == "video"]) == 0
        assert "cannot find evidence" in early_data["answer"].lower() or "watched so far" in early_data["answer"].lower()

        # 2. Query at t=130s (AFTER chunk ends at 120s) -> Permitted!
        res_late = client.post("/api/ask/", json={
            "course_id": "dl-101",
            "video_id": "lec-01",
            "timestamp": 130.0,
            "question": "What happens in traditional RNNs?"
        })
        assert res_late.status_code == 200
        late_data = res_late.json()
        video_sources = [s for s in late_data["sources"] if s["type"] == "video"]
        assert len(video_sources) > 0
        assert video_sources[0]["start_time"] == 60.0
        assert video_sources[0]["end_time"] == 120.0
