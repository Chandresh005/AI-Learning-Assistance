import os
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.chunk import TranscriptChunk
from app.models.video import Video


def run_transcription(file_path: str, model_size: str = "tiny") -> List[Dict[str, Any]]:
    """
    Transcribes audio/video file using faster-whisper.
    Returns raw segments with start and end timestamps.
    """
    from faster_whisper import WhisperModel

    # Load model (tiny/base for fast cpu transcription)
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments_generator, info = model.transcribe(file_path, beam_size=1, vad_filter=True)

    segments = []
    for segment in segments_generator:
        segments.append({
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip()
        })
    return segments


def chunk_segments(raw_segments: List[Dict[str, Any]], target_chunk_duration: float = 30.0) -> List[Dict[str, Any]]:
    """
    Groups raw transcript segments into semantically coherent chunk blocks of ~30-45 seconds,
    preserving exact start_time and end_time for precise citation jumps.
    """
    if not raw_segments:
        return []

    chunks = []
    current_texts = []
    chunk_start = raw_segments[0]["start"]
    chunk_end = raw_segments[0]["end"]
    chunk_index = 1

    for seg in raw_segments:
        current_texts.append(seg["text"])
        chunk_end = seg["end"]

        # If current accumulated duration exceeds target duration, flush chunk
        if (chunk_end - chunk_start) >= target_chunk_duration:
            chunks.append({
                "chunk_id": chunk_index,
                "start_time": chunk_start,
                "end_time": chunk_end,
                "text": " ".join(current_texts)
            })
            chunk_index += 1
            current_texts = []
            chunk_start = chunk_end

    # Flush any remaining text
    if current_texts:
        chunks.append({
            "chunk_id": chunk_index,
            "start_time": chunk_start,
            "end_time": chunk_end,
            "text": " ".join(current_texts)
        })

    return chunks


async def store_transcript_chunks(
    course_id: str,
    video_id: str,
    chunks: List[Dict[str, Any]],
    db: AsyncSession
) -> int:
    """
    Stores chunked transcript records in the database and updates video duration & status.
    """
    max_duration = 0.0
    for c in chunks:
        chunk_record = TranscriptChunk(
            course_id=course_id,
            video_id=video_id,
            chunk_id=c["chunk_id"],
            start_time=c["start_time"],
            end_time=c["end_time"],
            text=c["text"]
        )
        db.add(chunk_record)
        if c["end_time"] > max_duration:
            max_duration = c["end_time"]

    # Update Video record
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if video:
        video.transcript_status = "completed"
        if max_duration > 0 and video.duration == 0:
            video.duration = max_duration

    await db.commit()
    return len(chunks)
