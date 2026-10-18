"use client";

import React from "react";
import { Sparkles, Clock3, GraduationCap, ShieldCheck, ListVideo } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

function YouTubeIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface HeaderProps {
  currentTimestamp: number;
  duration: number;
  courseTitle?: string;
  lectureTitle?: string;
  onTogglePlaylist?: () => void;
  playlistCount?: number;
}

export function Header({
  currentTimestamp,
  duration,
  courseTitle = "100 Days of Machine Learning | CampusX",
  lectureTitle = "Day 01: What is Machine Learning?",
  onTogglePlaylist,
  playlistCount = 10
}: HeaderProps) {
  const progressPercent = duration > 0 ? Math.min(100, Math.round((currentTimestamp / duration) * 100)) : 0;

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-lg">Intelligent Learning Studio</span>
              <span className="bg-red-50 text-red-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                <YouTubeIcon className="w-3 h-3 fill-current" />
                <span>YouTube Mode</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[280px] sm:max-w-md">
              {courseTitle} &bull; <span className="text-slate-800 font-semibold">{lectureTitle}</span>
            </p>
          </div>
        </div>

        {/* Live Knowledge Boundary, Playlist Action & Progress Stats */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Playlist Button */}
          {onTogglePlaylist && (
            <button
              onClick={onTogglePlaylist}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              title="Browse playlist videos"
            >
              <ListVideo className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Playlist</span>
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {playlistCount}
              </span>
            </button>
          )}

          {/* Active Knowledge Boundary Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-700">
            <Clock3 className="w-4 h-4 text-blue-600" />
            <span>Scope:</span>
            <span className="font-mono-timestamp font-semibold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              00:00 &rarr; {formatTimestamp(currentTimestamp)}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium ml-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Future-Guarded
            </span>
          </div>

          {/* Watch Progress */}
          <div className="flex items-center gap-2 min-w-[90px]">
            <div className="text-right">
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Progress</div>
              <div className="text-xs font-bold text-slate-800">{progressPercent}%</div>
            </div>
            <div className="w-14 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
