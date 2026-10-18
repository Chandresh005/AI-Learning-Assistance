export interface VideoLecture {
  id: string;
  courseId: string;
  title: string;
  url: string;
  duration: number;
}

export interface TranscriptChunk {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface SourceCitation {
  type: "video" | "pdf" | "ppt";
  startTime?: number;
  endTime?: number;
  start_time?: number;
  end_time?: number;
  page?: number;
  slide?: number;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestampSeconds?: number;
  citations?: SourceCitation[];
  confidence?: number;
  isSpoilerProtected?: boolean;
  createdAt: string;
}
