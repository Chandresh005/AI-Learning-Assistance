from fastapi.testclient import TestClient
from app.main import app
from app.services.transcription import chunk_segments


def test_chunk_segments_logic():
    raw_segments = [
        {"start": 0.0, "end": 10.0, "text": "Hello world."},
        {"start": 10.0, "end": 25.0, "text": "This is a lecture on deep learning."},
        {"start": 25.0, "end": 40.0, "text": "We will cover transformers and attention."},
        {"start": 40.0, "end": 55.0, "text": "RNNs suffer from vanishing gradients."}
    ]

    # Target duration 30 seconds
    chunks = chunk_segments(raw_segments, target_chunk_duration=30.0)
    assert len(chunks) == 2
    assert chunks[0]["chunk_id"] == 1
    assert chunks[0]["start_time"] == 0.0
    assert chunks[0]["end_time"] == 40.0
    assert "transformers" in chunks[0]["text"]

    assert chunks[1]["chunk_id"] == 2
    assert chunks[1]["start_time"] == 40.0
    assert chunks[1]["end_time"] == 55.0


def test_transcription_api_endpoints():
    import uuid
    course_id = f"course-{uuid.uuid4().hex[:8]}"
    video_id = f"video-{uuid.uuid4().hex[:8]}"

    with TestClient(app) as client:
        # Register course and video
        client.post("/api/courses/", json={
            "id": course_id,
            "title": "Natural Language Processing"
        })
        client.post("/api/videos/", json={
            "id": video_id,
            "course_id": course_id,
            "title": "Attention Lecture",
            "storage_url": "/path/to/video.mp4"
        })

        # Seed transcript chunks
        seed_res = client.post(f"/api/videos/{video_id}/transcript-chunks", json=[
            {
                "chunk_id": 1,
                "start_time": 0.0,
                "end_time": 30.0,
                "text": "Introduction to attention mechanism."
            },
            {
                "chunk_id": 2,
                "start_time": 30.0,
                "end_time": 65.0,
                "text": "Queries, keys, and values are linear projections of input tokens."
            }
        ])
        assert seed_res.status_code == 200
        assert seed_res.json()["chunks_stored"] == 2

        # Check status endpoint
        status_res = client.get(f"/api/videos/{video_id}/status")
        assert status_res.status_code == 200
        status_data = status_res.json()
        assert status_data["status"] == "completed"
        assert status_data["transcript_chunks_count"] == 2
        assert status_data["duration"] == 65.0

        # Retrieve transcripts endpoint
        transcripts_res = client.get(f"/api/videos/{video_id}/transcripts")
        assert transcripts_res.status_code == 200
        chunks = transcripts_res.json()
        assert len(chunks) == 2
        assert chunks[0]["start_time"] == 0.0
        assert chunks[1]["end_time"] == 65.0
