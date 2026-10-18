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
  ExternalLink,
  Plus,
  X,
  Search,
  Sparkles
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

function YouTubeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface PlaylistVideoItem {
  id: string;
  title: string;
  url: string;
  duration: number;
  day: number;
  hasTranscripts: boolean;
}

const DEFAULT_PLAYLIST: PlaylistVideoItem[] = [
  {
    id: "vid-ml-day-01",
    day: 1,
    title: "Day 01: What is Machine Learning? | 100 Days of Machine Learning",
    url: "https://www.youtube.com/watch?v=ZftI2fEz0Fw",
    duration: 1200,
    hasTranscripts: true
  },
  {
    id: "vid-ml-day-02",
    day: 2,
    title: "Day 02: AI Vs ML Vs DL for Beginners in Hindi",
    url: "https://www.youtube.com/watch?v=1v3_AQ26jZ0",
    duration: 962,
    hasTranscripts: true
  },
  {
    id: "vid-ml-day-03",
    day: 3,
    title: "Day 03: Types of Machine Learning for Beginners (Supervised, Unsupervised, RL)",
    url: "https://www.youtube.com/watch?v=81ymPYEtFOw",
    duration: 1662,
    hasTranscripts: true
  },
  {
    id: "vid-ml-day-04",
    day: 4,
    title: "Day 04: Batch Machine Learning | Offline Vs Online Learning",
    url: "https://www.youtube.com/watch?v=nPrhFxEuTYU",
    duration: 688,
    hasTranscripts: false
  },
  {
    id: "vid-ml-day-05",
    day: 5,
    title: "Day 05: Online Machine Learning | Online Learning in Depth",
    url: "https://www.youtube.com/watch?v=3oOipgCbLIk",
    duration: 1168,
    hasTranscripts: false
  },
  {
    id: "vid-ml-day-06",
    day: 6,
    title: "Day 06: Instance-Based Vs Model-Based Learning",
    url: "https://www.youtube.com/watch?v=ntAOq1ioTKo",
    duration: 1004,
    hasTranscripts: false
  },
  {
    id: "vid-ml-day-07",
    day: 7,
    title: "Day 07: Challenges in Machine Learning | Problems in ML",
    url: "https://www.youtube.com/watch?v=WGUNAJki2S4",
    duration: 1420,
    hasTranscripts: false
  },
  {
    id: "vid-ml-day-08",
    day: 8,
    title: "Day 08: Application of Machine Learning | Real Life",
    url: "https://www.youtube.com/watch?v=UZio8TcTMrI",
    duration: 1742,
    hasTranscripts: false
  },
  {
    id: "vid-ml-day-09",
    day: 9,
    title: "Day 09: Machine Learning Development Life Cycle (MLDLC)",
    url: "https://www.youtube.com/watch?v=iDbhQGz_rEo",
    duration: 1513,
    hasTranscripts: false
  },
  {
    id: "vid-ml-day-10",
    day: 10,
    title: "Day 10: Data Roles (Engineer vs Analyst vs Scientist vs MLE)",
    url: "https://www.youtube.com/watch?v=93rKZs0MkgU",
    duration: 1583,
    hasTranscripts: false
  }
];

export default function LearningStudioPage() {
  const [courseId] = useState<string>("course-ml-100");
  const [courseTitle] = useState<string>("100 Days of Machine Learning | CampusX");
  const [playlist, setPlaylist] = useState<PlaylistVideoItem[]>(DEFAULT_PLAYLIST);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1200);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>("");

  const activeVideo = playlist[activeVideoIndex] || playlist[0];

  const handleTimeUpdate = (currentTime: number, totalDuration: number) => {
    setCurrentTimestamp(currentTime);
    if (totalDuration > 0 && Math.abs(totalDuration - duration) > 1.0) {
      setDuration(totalDuration);
    }
  };

  const handleSeekToTimestamp = (seconds: number) => {
    setCurrentTimestamp(seconds);
  };

  const handleSelectVideo = (index: number) => {
    setActiveVideoIndex(index);
    setCurrentTimestamp(0);
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
    setCustomUrlInput("");
    setIsPlaylistOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Application Header */}
      <Header
        currentTimestamp={currentTimestamp}
        duration={duration}
        courseTitle={courseTitle}
        lectureTitle={activeVideo.title}
        onTogglePlaylist={() => setIsPlaylistOpen(!isPlaylistOpen)}
        playlistCount={playlist.length}
      />

      {/* Playlist Drawer / Modal */}
      {isPlaylistOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <ListVideo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Course Playlist</h3>
                  <p className="text-xs text-slate-500">100 Days of Machine Learning</p>
                </div>
              </div>
              <button
                onClick={() => setIsPlaylistOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom URL Input */}
            <form onSubmit={handleAddCustomUrl} className="p-3 border-b border-slate-200 bg-blue-50/50">
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Load Any YouTube Video / Playlist URL:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Paste YouTube link (https://...)"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Load</span>
                </button>
              </div>
            </form>

            {/* Playlist Video Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {playlist.map((item, idx) => {
                const isActive = idx === activeVideoIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectVideo(idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                      isActive
                        ? "bg-blue-50 border-blue-400 ring-1 ring-blue-500/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isActive ? <Play className="w-3.5 h-3.5 fill-current" /> : item.day}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-semibold line-clamp-2 ${
                          isActive ? "text-blue-900" : "text-slate-800"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                        <span className="font-mono-timestamp">{formatTimestamp(item.duration)}</span>
                        <span>&bull;</span>
                        {item.hasTranscripts ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Transcripts Ready
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium">Video Ready</span>
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

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Quick Playlist Bar Banner */}
        <div className="mb-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/90 text-white flex items-center justify-center shrink-0 shadow-md">
              <YouTubeIcon className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Active Playlist:</span>
                <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  100 Days of Machine Learning
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                Current: <strong className="text-white">{activeVideo.title}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPlaylistOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ListVideo className="w-4 h-4 text-blue-300" />
              <span>Browse All Lectures ({playlist.length})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Video Player & Context Tabs (7 cols on lg screens) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <VideoPlayer
              currentTimestamp={currentTimestamp}
              onTimeUpdate={handleTimeUpdate}
              videoSrc={activeVideo.url}
              lectureTitle={activeVideo.title}
            />

            <ContentTabs
              currentTimestamp={currentTimestamp}
              duration={duration}
              onSeekToTimestamp={handleSeekToTimestamp}
              courseId={courseId}
              videoId={activeVideo.id}
            />
          </div>

          {/* Right Column: AI Learning Assistant Panel (5 cols on lg screens) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-20 h-[calc(100vh-6.5rem)]">
            <AssistantPanel
              currentTimestamp={currentTimestamp}
              onSeekToTimestamp={handleSeekToTimestamp}
              courseId={courseId}
              videoId={activeVideo.id}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
