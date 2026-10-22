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

export interface JevGateResult {
  gate_id: number;
  name: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface JevVerificationVerdict {
  verdict: "VERIFIED" | "REFUSAL_VERIFIED" | "WARNING" | "VIOLATION";
  overall_score: number;
  temporal_leakage_rate: number;
  groundedness_score: number;
  citation_precision: number;
  permitted_chunks_count: number;
  blocked_future_chunks_count: number;
  gates: JevGateResult[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestampSeconds?: number;
  citations?: SourceCitation[];
  confidence?: number;
  isSpoilerProtected?: boolean;
  jevVerdict?: JevVerificationVerdict;
  createdAt: string;
}
