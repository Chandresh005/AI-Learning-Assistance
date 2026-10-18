from fastapi.testclient import TestClient
from app.main import app


def test_ai_mock_interview_flow():
    with TestClient(app) as client:
        # 1. Start interview
        start_res = client.post("/api/interview/start", json={
            "target_role": "AI Engineer",
            "skill_level": "Senior",
            "resume_summary": "5 years experience training LLMs and architecting RAG pipelines."
        })
        assert start_res.status_code == 200
        start_data = start_res.json()
        assert "session_id" in start_data
        assert "first_question" in start_data
        session_id = start_data["session_id"]

        # 2. Turn 1
        res1 = client.post("/api/interview/respond", json={
            "session_id": session_id,
            "candidate_answer": "To address the quadratic complexity of self-attention, we used FlashAttention tiling and chunked computation to reduce memory reads."
        })
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["is_completed"] is False
        assert "next_question" in data1
        assert "grouped-query" in data1["next_question"].lower()

        # 3. Turn 2
        res2 = client.post("/api/interview/respond", json={
            "session_id": session_id,
            "candidate_answer": "Grouped-query attention reduces the number of key-value heads, which cuts down memory bandwidth during auto-regressive decoding while preserving perplexity."
        })
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["is_completed"] is False
        assert "next_question" in data2

        # 4. Turn 3 (Final turn)
        res3 = client.post("/api/interview/respond", json={
            "session_id": session_id,
            "candidate_answer": "For RAG grounding, we enforce temporal bounding on timestamps and verify all generated facts with reciprocal rank fusion citations."
        })
        assert res3.status_code == 200
        data3 = res3.json()
        assert data3["is_completed"] is True
        assert data3["scorecard"] is not None
        scorecard = data3["scorecard"]
        assert "overall_score" in scorecard
        assert "rubrics" in scorecard
        assert "strengths" in scorecard
        assert "improvement_areas" in scorecard
        assert "preparation_recommendations" in scorecard
