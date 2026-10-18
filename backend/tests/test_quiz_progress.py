import uuid
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.chunk import TranscriptChunk


def test_quiz_and_progress_flow():
    course_id = f"course-{uuid.uuid4().hex[:8]}"
    video_id = f"video-{uuid.uuid4().hex[:8]}"
    user_id = f"user-{uuid.uuid4().hex[:8]}"

    async def seed_lecture_data():
        async with AsyncSessionLocal() as session:
            c1 = TranscriptChunk(
                course_id=course_id,
                video_id=video_id,
                chunk_id=1,
                text="The query vector represents the current token searching for related context.",
                start_time=0.0,
                end_time=45.0
            )
            c2 = TranscriptChunk(
                course_id=course_id,
                video_id=video_id,
                chunk_id=2,
                text="Key vectors represent all previous tokens being indexed in memory.",
                start_time=45.0,
                end_time=90.0
            )
            session.add_all([c1, c2])
            await session.commit()

    asyncio.run(seed_lecture_data())

    with TestClient(app) as client:
        # Register course and video
        client.post("/api/courses/", json={"id": course_id, "title": "Transformer Deep Dive"})
        client.post("/api/videos/", json={"id": video_id, "course_id": course_id, "title": "Attention Lecture", "storage_url": "s3://v.mp4", "duration": 1800.0})

        # 1. Generate quiz at timestamp 60s
        quiz_res = client.post("/api/quiz/generate", json={
            "course_id": course_id,
            "video_id": video_id,
            "timestamp": 60.0,
            "count": 2
        })
        assert quiz_res.status_code == 200
        questions = quiz_res.json()
        assert len(questions) > 0
        q1 = questions[0]
        assert "options" in q1
        assert len(q1["options"]) == 4

        # 2. Submit quiz answer
        submit_res = client.post("/api/quiz/submit", json={
            "user_id": user_id,
            "course_id": course_id,
            "video_id": video_id,
            "answers": [
                {"question_id": q1["id"], "selected_option": q1["correct_option"]}
            ]
        })
        assert submit_res.status_code == 200
        submission_data = submit_res.json()
        assert submission_data["score"] == 1
        assert submission_data["total"] == 1
        assert submission_data["percentage"] == 100.0

        # 3. Track learner watch progress
        track_res = client.post("/api/progress/track", json={
            "user_id": user_id,
            "course_id": course_id,
            "video_id": video_id,
            "last_timestamp": 900.0,
            "duration": 1800.0
        })
        assert track_res.status_code == 200
        assert track_res.json()["watch_percentage"] == 50.0

        # 4. Fetch learner progress & analytics
        prog_res = client.get(f"/api/progress/?course_id={course_id}&video_id={video_id}&user_id={user_id}")
        assert prog_res.status_code == 200
        prog_data = prog_res.json()
        assert prog_data["last_timestamp"] == 900.0
        assert prog_data["watch_percentage"] == 50.0
        assert prog_data["quizzes_attempted_count"] == 1


def test_conversation_history_persistence():
    course_id = f"course-{uuid.uuid4().hex[:8]}"
    video_id = f"video-{uuid.uuid4().hex[:8]}"
    conv_id = f"conv-{uuid.uuid4().hex[:8]}"

    with TestClient(app) as client:
        client.post("/api/courses/", json={"id": course_id, "title": "NLP Course"})
        client.post("/api/videos/", json={"id": video_id, "course_id": course_id, "title": "Vid", "storage_url": "s3://v.mp4"})

        # Ask question 1
        client.post("/api/ask/", json={
            "course_id": course_id,
            "video_id": video_id,
            "timestamp": 120.0,
            "question": "What is an attention head?",
            "conversation_id": conv_id
        })

        # Ask question 2
        client.post("/api/ask/", json={
            "course_id": course_id,
            "video_id": video_id,
            "timestamp": 150.0,
            "question": "Can you summarize that in one sentence?",
            "conversation_id": conv_id
        })

        # Fetch conversation history
        hist_res = client.get(f"/api/ask/conversations/{conv_id}")
        assert hist_res.status_code == 200
        messages = hist_res.json()
        assert len(messages) == 4  # 2 user questions + 2 assistant answers
        assert messages[0]["role"] == "user"
        assert messages[1]["role"] == "assistant"
        assert messages[2]["role"] == "user"
        assert messages[3]["role"] == "assistant"
