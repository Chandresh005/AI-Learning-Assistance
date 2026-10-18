import re
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.course import Course
from app.models.video import Video
from app.models.chunk import TranscriptChunk
from app.services.transcription import chunk_segments, store_transcript_chunks


def extract_youtube_video_id(url_or_id: str) -> Optional[str]:
    """Extract 11-character YouTube video ID from various URL formats."""
    if not url_or_id:
        return None
    url_or_id = url_or_id.strip()
    if re.match(r"^[a-zA-Z0-9_-]{11}$", url_or_id):
        return url_or_id

    patterns = [
        r"(?:v=|\/v\/|embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})",
        r"[?&]v=([a-zA-Z0-9_-]{11})"
    ]
    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)
    return None


def extract_youtube_playlist_id(url_or_id: str) -> Optional[str]:
    """Extract YouTube playlist ID from URL or string."""
    if not url_or_id:
        return None
    url_or_id = url_or_id.strip()
    match = re.search(r"[?&]list=([a-zA-Z0-9_-]+)", url_or_id)
    if match:
        return match.group(1)
    if url_or_id.startswith("PL"):
        return url_or_id
    return None


def fetch_youtube_playlist_metadata(playlist_url_or_id: str, max_items: int = 25) -> Dict[str, Any]:
    """
    Extracts playlist metadata and video entries using yt-dlp flat extraction without downloading.
    """
    import yt_dlp

    playlist_id = extract_youtube_playlist_id(playlist_url_or_id) or playlist_url_or_id
    if not playlist_id.startswith("http"):
        url = f"https://www.youtube.com/playlist?list={playlist_id}"
    else:
        url = playlist_id

    ydl_opts = {
        "extract_flat": True,
        "quiet": True,
        "playlist_items": f"1-{max_items}"
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        entries = []
        for e in info.get("entries", []):
            if e.get("id"):
                entries.append({
                    "id": e.get("id"),
                    "title": e.get("title", f"Video {e.get('id')}"),
                    "duration": float(e.get("duration") or 0.0),
                    "url": f"https://www.youtube.com/watch?v={e.get('id')}"
                })
        return {
            "title": info.get("title", "YouTube Playlist"),
            "playlist_id": playlist_id,
            "entries": entries
        }
