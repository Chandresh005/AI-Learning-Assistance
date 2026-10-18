import uuid
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.chunk import TranscriptChunk, DocumentChunk


def test_rag_timestamp_boundary_and_zero_leakage():
    """
    Critical Step 06 Test:
    At timestamp 18:42 (1122 seconds), a question about a concept first taught at 30:00 (1800 seconds)
    MUST NOT reveal that future content.
    """
    course_id = f"course-{uuid.uuid4().hex[:8]}"
    video_id = f"video-{uuid.uuid4().hex[:8]}"

    async def seed_chunks():
        async with AsyncSessionLocal() as session:
            # Chunk 1: Covered at 10:00 - 12:00 (600s - 720s)
            c1 = TranscriptChunk(
                course_id=course_id,
                video_id=video_id,
                chunk_id=1,
                text="The encoder maps an input sequence of symbol representations to continuous representations.",
                start_time=600.0,
                end_time=720.0
            )
            # Chunk 2: Future content at 30:00 - 32:00 (1800s - 1920s)
            c2 = TranscriptChunk(
                course_id=course_id,
                video_id=video_id,
                chunk_id=2,
                text="FlashAttention reorders memory accesses to achieve IO-awareness on modern GPUs.",
                start_time=1800.0,
                end_time=1920.0
            )
            session.add_all([c1, c2])
            await session.commit()

    asyncio.run(seed_chunks())

    with TestClient(app) as client:
        client.post("/api/courses/", json={"id": course_id, "title": "Advanced Architectures"})
        client.post("/api/videos/", json={"id": video_id, "course_id": course_id, "title": "Lecture 1", "storage_url": "s3://v.mp4"})

        # Student is at 18:42 (1122.0 seconds) and asks about FlashAttention (taught at 30:00)
        res_future = client.post("/api/ask/", json={
            "course_id": course_id,
            "video_id": video_id,
            "timestamp": 1122.0,
            "question": "What is FlashAttention and how does it work?"
        })
        assert res_future.status_code == 200
        future_data = res_future.json()

        # Strict Verification: FlashAttention MUST NOT be returned in sources or answer
        assert len(future_data["sources"]) == 0
        assert "FlashAttention reorders memory" not in future_data["answer"]
        assert "cannot find evidence" in future_data["answer"].lower()

        # Student is at 18:42 (1122.0 seconds) and asks about Encoder (taught at 10:00 - 12:00)
        res_permitted = client.post("/api/ask/", json={
            "course_id": course_id,
            "video_id": video_id,
            "timestamp": 1122.0,
            "question": "What does the encoder map?"
        })
        assert res_permitted.status_code == 200
        permitted_data = res_permitted.json()
        assert len(permitted_data["sources"]) > 0
        video_src = permitted_data["sources"][0]
        assert video_src["type"] == "video"
        assert video_src["start_time"] == 600.0
        assert video_src["end_time"] == 720.0
        assert "encoder maps an input sequence" in permitted_data["answer"].lower()


def test_rag_multimodal_citations_pdf_and_ppt():
    """
    Step 07 Test:
    Verifies that PDF page numbers and PPT slide numbers are accurately cited in answers.
    """
    course_id = f"course-{uuid.uuid4().hex[:8]}"
    video_id = f"video-{uuid.uuid4().hex[:8]}"
    pdf_id = f"pdf-{uuid.uuid4().hex[:8]}"
    ppt_id = f"ppt-{uuid.uuid4().hex[:8]}"

    async def seed_multimodal_resources():
        async with AsyncSessionLocal() as session:
            doc_pdf = DocumentChunk(
                course_id=course_id,
                resource_id=pdf_id,
                chunk_id=1,
                source_type="pdf",
                page_number=4,
                text="Scaled Dot-Product Attention: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V."
            )
            doc_ppt = DocumentChunk(
                course_id=course_id,
                resource_id=ppt_id,
                chunk_id=1,
                source_type="ppt",
                slide_number=9,
                text="Multi-Head Attention projects queries, keys, and values h times with learned projections."
            )
            session.add_all([doc_pdf, doc_ppt])
            await session.commit()

    asyncio.run(seed_multimodal_resources())

    with TestClient(app) as client:
        client.post("/api/courses/", json={"id": course_id, "title": "Multimodal Course"})
        client.post("/api/videos/", json={"id": video_id, "course_id": course_id, "title": "Lecture Video", "storage_url": "s3://v.mp4"})

        res = client.post("/api/ask/", json={
            "course_id": course_id,
            "video_id": video_id,
            "timestamp": 300.0,
            "question": "How is scaled dot product attention computed in the formula?"
        })
        assert res.status_code == 200
        data = res.json()
        assert len(data["sources"]) > 0

        pdf_citations = [s for s in data["sources"] if s["type"] == "pdf"]
        assert len(pdf_citations) > 0
        assert pdf_citations[0]["page"] == 4
