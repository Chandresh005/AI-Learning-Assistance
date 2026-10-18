import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.services.document_parser import chunk_document_elements


def test_chunk_document_elements_preserves_page_and_slide():
    pdf_pages = [
        {"page_number": 1, "text": "Chapter 1: Transformer Architecture Overview."},
        {"page_number": 2, "text": "Section 1.1: Multi-Head Self-Attention formulation."}
    ]
    pdf_chunks = chunk_document_elements(pdf_pages, source_type="pdf")
    assert len(pdf_chunks) == 2
    assert pdf_chunks[0]["page_number"] == 1
    assert pdf_chunks[0]["source_type"] == "pdf"
    assert pdf_chunks[1]["page_number"] == 2

    ppt_slides = [
        {"slide_number": 5, "text": "Slide 5: Scaled Dot-Product Diagram."},
        {"slide_number": 6, "text": "Slide 6: Computational Complexity O(n^2)."}
    ]
    ppt_chunks = chunk_document_elements(ppt_slides, source_type="ppt")
    assert len(ppt_chunks) == 2
    assert ppt_chunks[0]["slide_number"] == 5
    assert ppt_chunks[0]["source_type"] == "ppt"
    assert ppt_chunks[1]["slide_number"] == 6


def test_document_ingestion_api():
    course_id = f"course-{uuid.uuid4().hex[:8]}"
    resource_id = f"res-{uuid.uuid4().hex[:8]}"

    with TestClient(app) as client:
        # 1. Register course
        client.post("/api/courses/", json={"id": course_id, "title": "NLP Transformers"})

        # 2. Register resource
        client.post("/api/resources/", json={
            "id": resource_id,
            "course_id": course_id,
            "type": "pdf",
            "title": "Attention Paper.pdf",
            "storage_url": "/path/to/paper.pdf"
        })

        # 3. Seed page-aware chunks
        seed_res = client.post(f"/api/resources/{resource_id}/chunks", json=[
            {
                "chunk_id": 1,
                "text": "The Transformer uses multi-head attention instead of recurrence.",
                "source_type": "pdf",
                "page_number": 3
            },
            {
                "chunk_id": 2,
                "text": "Positional encodings inject token order information.",
                "source_type": "pdf",
                "page_number": 6
            }
        ])
        assert seed_res.status_code == 200
        assert seed_res.json()["chunks_stored"] == 2

        # 4. Fetch chunks and verify page numbers
        get_res = client.get(f"/api/resources/{resource_id}/chunks")
        assert get_res.status_code == 200
        chunks = get_res.json()
        assert len(chunks) == 2
        assert chunks[0]["page_number"] == 3
        assert chunks[1]["page_number"] == 6
