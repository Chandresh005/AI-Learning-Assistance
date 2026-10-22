"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header/Header";
import { VideoPlayer } from "@/components/video-player/VideoPlayer";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { ContentTabs } from "@/components/tabs/ContentTabs";
import {
  ListVideo,
  Play,
  CheckCircle2,
  Plus,
  X
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { TranscriptChunk } from "@/types";

export interface PlaylistVideoItem {
  id: string;
  title: string;
  url: string;
  duration: number;
  day: number;
  hasTranscripts: boolean;
  summary?: string;
  topics?: string[];
}

export const DEFAULT_PLAYLIST: PlaylistVideoItem[] = [
  {
    id: "vid-ml-day-01",
    day: 1,
    title: "Day 01: What is Machine Learning? | 100 Days of Machine Learning",
    url: "https://www.youtube.com/watch?v=ZftI2fEz0Fw",
    duration: 1200,
    hasTranscripts: true,
    summary: "Traditional programming vs ML paradigm, Arthur Samuel & Tom Mitchell E-T-P definitions, and the end-to-end MLDLC.",
    topics: ["Arthur Samuel", "Tom Mitchell E-T-P", "MLDLC"]
  },
  {
    id: "vid-ml-day-02",
    day: 2,
    title: "Day 02: AI Vs ML Vs DL for Beginners in Hindi",
    url: "https://www.youtube.com/watch?v=1v3_AQ26jZ0",
    duration: 962,
    hasTranscripts: true,
    summary: "Demystifying the concentric hierarchy of Artificial Intelligence, Statistical Machine Learning, and Deep Neural Networks.",
    topics: ["Symbolic AI", "Statistical ML", "Deep Learning"]
  },
  {
    id: "vid-ml-day-03",
    day: 3,
    title: "Day 03: Types of Machine Learning for Beginners (Supervised, Unsupervised, RL)",
    url: "https://www.youtube.com/watch?v=81ymPYEtFOw",
    duration: 1662,
    hasTranscripts: true,
    summary: "Supervised regression & classification, unsupervised clustering & dimensionality reduction, and reinforcement learning.",
    topics: ["Supervised", "Unsupervised", "Reinforcement"]
  },
  {
    id: "vid-ml-day-04",
    day: 4,
    title: "Day 04: Batch Machine Learning | Offline Vs Online Learning",
    url: "https://www.youtube.com/watch?v=nPrhFxEuTYU",
    duration: 688,
    hasTranscripts: false,
    summary: "Static batch training pipelines, model retraining schedules, and offline deployment trade-offs.",
    topics: ["Batch Training", "Concept Drift", "Offline ML"]
  },
  {
    id: "vid-ml-day-05",
    day: 5,
    title: "Day 05: Online Machine Learning | Online Learning in Depth",
    url: "https://www.youtube.com/watch?v=3oOipgCbLIk",
    duration: 1168,
    hasTranscripts: false,
    summary: "Incremental mini-batch updates, out-of-core learning, learning rate schedules, and streaming data safeguards.",
    topics: ["Incremental Learning", "SGD", "Out-of-Core"]
  },
  {
    id: "vid-ml-day-06",
    day: 6,
    title: "Day 06: Instance-Based Vs Model-Based Learning",
    url: "https://www.youtube.com/watch?v=ntAOq1ioTKo",
    duration: 1004,
    hasTranscripts: false,
    summary: "Memory-based lazy learners (KNN) versus parameterized functional learners (Linear Regression, Neural Nets).",
    topics: ["KNN", "Parametric Models", "Generalization"]
  },
  {
    id: "vid-ml-day-07",
    day: 7,
    title: "Day 07: Challenges in Machine Learning | Problems in ML",
    url: "https://www.youtube.com/watch?v=WGUNAJki2S4",
    duration: 1420,
    hasTranscripts: false,
    summary: "Insufficient training data, non-representative sampling, poor data quality, overfitting, and underfitting.",
    topics: ["Overfitting", "Underfitting", "Sampling Bias"]
  },
  {
    id: "vid-ml-day-08",
    day: 8,
    title: "Day 08: Application of Machine Learning | Real Life",
    url: "https://www.youtube.com/watch?v=UZio8TcTMrI",
    duration: 1742,
    hasTranscripts: false,
    summary: "Production case studies across healthcare diagnostics, autonomous perception, recommendation engines, and NLP.",
    topics: ["Recommender Systems", "Computer Vision", "NLP"]
  },
  {
    id: "vid-ml-day-09",
    day: 9,
    title: "Day 09: Machine Learning Development Life Cycle (MLDLC)",
    url: "https://www.youtube.com/watch?v=iDbhQGz_rEo",
    duration: 1513,
    hasTranscripts: false,
    summary: "End-to-end engineering workflow from problem framing and EDA to feature engineering, deployment, and monitoring.",
    topics: ["EDA", "Feature Engineering", "MLOps"]
  },
  {
    id: "vid-ml-day-10",
    day: 10,
    title: "Day 10: Data Roles (Engineer vs Analyst vs Scientist vs MLE)",
    url: "https://www.youtube.com/watch?v=93rKZs0MkgU",
    duration: 1583,
    hasTranscripts: false,
    summary: "Responsibilities, skill matrices, and collaboration workflows across modern data and AI engineering teams.",
    topics: ["Data Engineer", "Data Scientist", "ML Engineer"]
  }
];

interface LearningStudioWorkspaceProps {
  initialDayIndex?: number;
  initialCustomUrl?: string;
  onBackToHome?: () => void;
}

export function LearningStudioWorkspace({
  initialDayIndex = 0,
  initialCustomUrl,
  onBackToHome
}: LearningStudioWorkspaceProps) {
  const [courseId] = useState<string>("course-ml-100");
  const [courseTitle] = useState<string>("100 Days of Machine Learning | CampusX");
  const [playlist, setPlaylist] = useState<PlaylistVideoItem[]>(DEFAULT_PLAYLIST);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(initialDayIndex);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [maxWatchedTimestamp, setMaxWatchedTimestamp] = useState<number>(0);
  const [duration, setDuration] = useState<number>(
    DEFAULT_PLAYLIST[initialDayIndex]?.duration || 1200
  );
  const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>("");

  // Studio UI/UX States
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(true);
  const [chapters, setChapters] = useState<TranscriptChunk[]>([]);
  const [pauseSignal, setPauseSignal] = useState<number>(0);
  const [externalPrompt, setExternalPrompt] = useState<{ text: string; id: number } | null>(null);

  useEffect(() => {
    if (initialCustomUrl && initialCustomUrl.trim()) {
      const newVideo: PlaylistVideoItem = {
        id: `vid-custom-${Date.now()}`,
        day: DEFAULT_PLAYLIST.length + 1,
        title: `Custom YouTube Lecture: ${initialCustomUrl.trim()}`,
        url: initialCustomUrl.trim(),
        duration: 1200,
        hasTranscripts: false
      };
      setPlaylist([newVideo, ...DEFAULT_PLAYLIST]);
      setActiveVideoIndex(0);
    } else if (initialDayIndex >= 0 && initialDayIndex < DEFAULT_PLAYLIST.length) {
      setActiveVideoIndex(initialDayIndex);
      setDuration(DEFAULT_PLAYLIST[initialDayIndex].duration || 1200);
    }
  }, [initialDayIndex, initialCustomUrl]);

  const activeVideo = playlist[activeVideoIndex] || playlist[0];

  const handleTimeUpdate = (currentTime: number, totalDuration: number) => {
    setCurrentTimestamp(currentTime);
    setMaxWatchedTimestamp((prev) => Math.max(prev, currentTime));
    if (totalDuration > 0 && Math.abs(totalDuration - duration) > 1.0) {
      setDuration(totalDuration);
    }
  };

  const handleSeekToTimestamp = (seconds: number) => {
    setCurrentTimestamp(seconds);
    setMaxWatchedTimestamp((prev) => Math.max(prev, seconds));
  };

  const handleSelectVideo = (index: number) => {
    setActiveVideoIndex(index);
    setCurrentTimestamp(0);
    setMaxWatchedTimestamp(0);
    setDuration(playlist[index].duration || 1200);
    setIsPlaylistOpen(false);
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const newVideo: PlaylistVideoItem = {
      id: `vid-custom-${Date.now()}`,
      day: playlist.length + 1,
      title: `Custom YouTube Lecture: ${customUrlInput.trim()}`,
      url: customUrlInput.trim(),
      duration: 1200,
      hasTranscripts: false
    };

    setPlaylist((prev) => [newVideo, ...prev]);
    setActiveVideoIndex(0);
    setCurrentTimestamp(0);
    setMaxWatchedTimestamp(0);
    setCustomUrlInput("");
    setIsPlaylistOpen(false);
  };

  const handleExplainSegment = (chunk: TranscriptChunk) => {
    const targetTime = Math.max(currentTimestamp, chunk.endTime);
    handleSeekToTimestamp(targetTime);
    setPauseSignal((s) => s + 1);
    setExternalPrompt({
      text: `Explain this lecture segment (${formatTimestamp(chunk.startTime)}–${formatTimestamp(chunk.endTime)}): "${chunk.text}"`,
      id: Date.now()
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isDark ? "bg-[#0B0F19] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Top Application Header */}
      <Header
        currentTimestamp={currentTimestamp}
        duration={duration}
        courseTitle={courseTitle}
        lectureTitle={activeVideo.title}
        onTogglePlaylist={() => setIsPlaylistOpen(!isPlaylistOpen)}
        playlistCount={playlist.length}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isTheaterMode={isTheaterMode}
        onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
        isSidebarPinned={isSidebarPinned}
        onToggleSidebarPin={() => setIsSidebarPinned(!isSidebarPinned)}
        onBackToHome={onBackToHome}
      />

      {/* Slide-Over Playlist Drawer (Mobile / Quick Access) */}
      {isPlaylistOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div
            className={`w-full max-w-md h-full shadow-2xl flex flex-col border-l ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <ListVideo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Course Playlist</h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    100 Days of Machine Learning
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPlaylistOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom URL Input */}
            <form
              onSubmit={handleAddCustomUrl}
              className={`p-3 border-b ${
                isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200 bg-blue-50/50"
              }`}
            >
              <label className="text-[11px] font-semibold block mb-1">
                Load Any YouTube Video / Playlist URL:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Paste YouTube link (https://...)"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className={`flex-1 text-xs border rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Load</span>
                </button>
              </div>
            </form>

            {/* Playlist Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {playlist.map((item, idx) => {
                const isActive = idx === activeVideoIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectVideo(idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                      isActive
                        ? isDark
                          ? "bg-blue-950/60 border-blue-500/70 ring-1 ring-blue-500/30"
                          : "bg-blue-50 border-blue-400 ring-1 ring-blue-500/20"
                        : isDark
                        ? "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : isDark
                          ? "bg-slate-800 text-slate-400"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isActive ? <Play className="w-3.5 h-3.5 fill-current" /> : item.day}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold line-clamp-2">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                        <span className="font-mono-timestamp">{formatTimestamp(item.duration)}</span>
                        <span>&bull;</span>
                        {item.hasTranscripts ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Indexed
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium">Stream Ready</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main 3-Zone Studio Workspace */}
      <main
        className={`flex-1 w-full mx-auto p-3 sm:p-5 transition-all ${
          isTheaterMode ? "max-w-[1800px]" : "max-w-[1600px]"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Zone: Collapsible Pinned Course Roadmap Rail (Desktop XL) */}
          {isSidebarPinned && !isTheaterMode && (
            <aside
              className={`hidden xl:flex xl:col-span-2 flex-col rounded-2xl border overflow-hidden sticky top-20 max-h-[calc(100vh-6.5rem)] ${
                isDark
                  ? "bg-slate-900/90 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900 shadow-xs"
              }`}
            >
              <div
                className={`p-3 border-b flex items-center justify-between ${
                  isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ListVideo className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold">Course Modules</span>
                </div>
                <span className="text-[10px] font-mono-timestamp px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-semibold">
                  {activeVideoIndex + 1}/{playlist.length}
                </span>
              </div>

              {/* Quick URL Add inside Rail */}
              <form
                onSubmit={handleAddCustomUrl}
                className={`p-2 border-b ${isDark ? "border-slate-800/80" : "border-slate-200"}`}
              >
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Paste YouTube URL..."
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className={`w-full text-[11px] rounded-lg px-2 py-1 border focus:outline-hidden ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500"
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer shrink-0"
                    title="Load YouTube URL"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {playlist.map((item, idx) => {
                  const isActive = idx === activeVideoIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectVideo(idx)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                        isActive
                          ? isDark
                            ? "bg-blue-950/70 border-blue-500/70 text-white shadow-sm"
                            : "bg-blue-50 border-blue-300 text-blue-950"
                          : isDark
                          ? "bg-slate-950/40 border-slate-800/70 text-slate-300 hover:bg-slate-800/60"
                          : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : isDark
                            ? "bg-slate-800 text-slate-400"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isActive ? <Play className="w-3 h-3 fill-current" /> : item.day}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold line-clamp-2 leading-snug text-[11px]">
                          {item.title.replace(/ \| 100 Days of Machine Learning/i, "")}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] opacity-75">
                          <span className="font-mono-timestamp">{formatTimestamp(item.duration)}</span>
                          {item.hasTranscripts && (
                            <span className="text-emerald-400 font-semibold">✔ RAG</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          {/* Center Zone: Video Theatre & Synchronized Bottom Dock */}
          <div
            className={`flex flex-col gap-5 ${
              isSidebarPinned && !isTheaterMode
                ? "lg:col-span-7 xl:col-span-6"
                : "lg:col-span-7 xl:col-span-8"
            }`}
          >
            <VideoPlayer
              currentTimestamp={currentTimestamp}
              maxWatchedTimestamp={maxWatchedTimestamp}
              onTimeUpdate={handleTimeUpdate}
              videoSrc={activeVideo.url}
              lectureTitle={activeVideo.title}
              chapters={chapters}
              pauseSignal={pauseSignal}
              isDark={isDark}
            />

            <ContentTabs
              currentTimestamp={currentTimestamp}
              duration={duration}
              onSeekToTimestamp={handleSeekToTimestamp}
              courseId={courseId}
              videoId={activeVideo.id}
              onTranscriptsLoaded={setChapters}
              onExplainSegment={handleExplainSegment}
              isDark={isDark}
            />
          </div>

          {/* Right Zone: Sticky AI Learning Copilot */}
          <div
            className={`sticky top-20 h-[calc(100vh-6.5rem)] ${
              isSidebarPinned && !isTheaterMode
                ? "lg:col-span-5 xl:col-span-4"
                : "lg:col-span-5 xl:col-span-4"
            }`}
          >
            <AssistantPanel
              currentTimestamp={currentTimestamp}
              onSeekToTimestamp={handleSeekToTimestamp}
              courseId={courseId}
              videoId={activeVideo.id}
              onRequestPause={() => setPauseSignal((s) => s + 1)}
              externalPrompt={externalPrompt}
              isDark={isDark}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
