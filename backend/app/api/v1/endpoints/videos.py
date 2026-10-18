from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.video import Video
from app.schemas.video import VideoCreate, VideoResponse

router = APIRouter()


@router.get("/", response_model=List[VideoResponse], summary="List all videos")
async def list_videos(course_id: str = None, db: AsyncSession = Depends(get_db)):
    query = select(Video)
    if course_id:
        query = query.where(Video.course_id == course_id)
    result = await db.execute(query.order_by(Video.created_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=VideoResponse, summary="Create a new video record")
async def create_video(video_in: VideoCreate, db: AsyncSession = Depends(get_db)):
    video = Video(
        id=video_in.id or None,
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


@router.get("/{video_id}", response_model=VideoResponse, summary="Get video details")
async def get_video(video_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video
