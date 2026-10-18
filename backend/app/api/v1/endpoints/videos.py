import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.database import get_db, AsyncSessionLocal
from app.models.video import Video
from app.models.chunk import TranscriptChunk
from app.schemas.video import VideoCreate, VideoResponse
from app.services.transcription import run_transcription, chunk_segments, store_transcript_chunks

router = APIRouter()


async def process_video_transcription_background(course_id: str, video_id: str, file_path: str):
    """Background task executing transcription and chunk storage."""
    try:
        # Run transcription with faster-whisper
        raw_segments = run_transcription(file_path, model_size="tiny")
        chunks = chunk_segments(raw_segments)

        async with AsyncSessionLocal() as session:
            await store_transcript_chunks(course_id, video_id, chunks, session)
    except Exception as e:
        async with AsyncSessionLocal() as session:
            res = await session.execute(select(Video).where(Video.id == video_id))
            vid = res.scalar_one_or_none()
            if vid:
                vid.transcript_status = f"failed: {str(e)}"
                await session.commit()


@router.get("/", response_model=List[VideoResponse], summary="List all videos")
async def list_videos(course_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Video)
    if course_id:
        query = query.where(Video.course_id == course_id)
    result = await db.execute(query.order_by(Video.created_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=VideoResponse, summary="Register a video record")
async def create_video(video_in: VideoCreate, db: AsyncSession = Depends(get_db)):
    video = Video(
        id=video_in.id or str(uuid.uuid4()),
        course_id=video_in.course_id,
        title=video_in.title,
        storage_url=video_in.storage_url,
        duration=video_in.duration,
        transcript_status="pending"
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)
    return video


@router.post("/upload", response_model=VideoResponse, summary="Upload an educational video and trigger transcription")
async def upload_video(
    background_tasks: BackgroundTasks,
    course_id: str = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    video_id = str(uuid.uuid4())
    upload_dir = os.path.join(settings.UPLOAD_DIR, "videos")
    os.makedirs(upload_dir, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1] or ".mp4"
    saved_filename = f"{video_id}{file_extension}"
    saved_path = os.path.join(upload_dir, saved_filename)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    video = Video(
        id=video_id,
        course_id=course_id,
        title=title,
        storage_url=saved_path,
        duration=0.0,
        transcript_status="processing"
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)

    # Queue async transcription in background
    background_tasks.add_task(process_video_transcription_background, course_id, video_id, saved_path)

    return video


@router.post("/{video_id}/transcript-chunks", summary="Directly seed timestamped transcript chunks")
async def seed_transcript_chunks(
    video_id: str,
    chunks: List[dict],
    db: AsyncSession = Depends(get_db)
):
    """Allows seeding or uploading pre-generated transcript chunks (e.g. from SRT/VTT/Whisper JSON)."""
    res = await db.execute(select(Video).where(Video.id == video_id))
    video = res.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    count = await store_transcript_chunks(video.course_id, video_id, chunks, db)
    return {"status": "success", "chunks_stored": count}


@router.get("/{video_id}", response_model=VideoResponse, summary="Get video details")
async def get_video(video_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.get("/{video_id}/transcripts", summary="Get timestamped transcript chunks for a video")
async def get_video_transcripts(video_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TranscriptChunk)
        .where(TranscriptChunk.video_id == video_id)
        .order_by(TranscriptChunk.start_time.asc())
    )
    chunks = result.scalars().all()
    return [
        {
            "id": c.id,
            "chunk_id": c.chunk_id,
            "start_time": c.start_time,
            "end_time": c.end_time,
            "text": c.text
        }
        for c in chunks
    ]


@router.get("/{video_id}/status", summary="Check transcription and processing status")
async def get_video_status(video_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    chunks_count = await db.execute(
        select(TranscriptChunk).where(TranscriptChunk.video_id == video_id)
    )
    count = len(chunks_count.scalars().all())

    return {
        "video_id": video.id,
        "status": video.transcript_status,
        "duration": video.duration,
        "transcript_chunks_count": count
    }
