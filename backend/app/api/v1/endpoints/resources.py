import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.database import get_db
from app.models.resource import Resource
from app.models.chunk import DocumentChunk
from app.schemas.resource import ResourceCreate, ResourceResponse
from app.services.document_parser import (
    extract_text_from_pdf,
    extract_text_from_pptx,
    chunk_document_elements,
    store_document_chunks
)

router = APIRouter()


@router.get("/", response_model=List[ResourceResponse], summary="List course resources")
async def list_resources(course_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Resource)
    if course_id:
        query = query.where(Resource.course_id == course_id)
    result = await db.execute(query.order_by(Resource.created_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=ResourceResponse, summary="Register a resource record")
async def create_resource(res_in: ResourceCreate, db: AsyncSession = Depends(get_db)):
    resource = Resource(
        id=res_in.id or str(uuid.uuid4()),
        course_id=res_in.course_id,
        type=res_in.type,
        title=res_in.title,
        storage_url=res_in.storage_url
    )
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return resource


@router.post("/upload", response_model=ResourceResponse, summary="Upload PDF or PPTX file and extract page/slide chunks")
async def upload_resource(
    course_id: str = Form(...),
    title: str = Form(...),
    resource_type: str = Form(...),  # "pdf" or "ppt"
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    resource_id = str(uuid.uuid4())
    subfolder = "pdfs" if resource_type == "pdf" else "ppts"
    upload_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(upload_dir, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1]
    saved_filename = f"{resource_id}{file_extension}"
    saved_path = os.path.join(upload_dir, saved_filename)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Parse document based on type
    if resource_type.lower() == "pdf":
        elements = extract_text_from_pdf(saved_path)
    elif resource_type.lower() in ["ppt", "pptx"]:
        elements = extract_text_from_pptx(saved_path)
    else:
        elements = []

    chunks = chunk_document_elements(elements, source_type=resource_type.lower())

    resource = Resource(
        id=resource_id,
        course_id=course_id,
        type=resource_type.lower(),
        title=title,
        storage_url=saved_path
    )
    db.add(resource)
    await db.commit()
    await db.refresh(resource)

    # Store chunks with page / slide metadata
    if chunks:
        await store_document_chunks(course_id, resource_id, chunks, db)

    return resource


@router.post("/{resource_id}/chunks", summary="Seed document chunks directly")
async def seed_chunks(
    resource_id: str,
    chunks: List[dict],
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = res.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    count = await store_document_chunks(resource.course_id, resource_id, chunks, db)
    return {"status": "success", "chunks_stored": count}


@router.get("/{resource_id}/chunks", summary="Get parsed document chunks with page or slide numbers")
async def get_resource_chunks(resource_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DocumentChunk)
        .where(DocumentChunk.resource_id == resource_id)
        .order_by(DocumentChunk.chunk_id.asc())
    )
    chunks = result.scalars().all()
    return [
        {
            "id": c.id,
            "chunk_id": c.chunk_id,
            "source_type": c.source_type,
            "page_number": c.page_number,
            "slide_number": c.slide_number,
            "text": c.text
        }
        for c in chunks
    ]
