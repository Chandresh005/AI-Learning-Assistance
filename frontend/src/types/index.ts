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
  createdAt: string;
}
