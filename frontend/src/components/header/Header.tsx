"use client";

import React from "react";
import { Sparkles, Clock3, GraduationCap, ShieldCheck } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

interface HeaderProps {
  currentTimestamp: number;
  duration: number;
  courseTitle?: string;
  lectureTitle?: string;
}

export function Header({
  currentTimestamp,
  duration,
  courseTitle = "Deep Learning & NLP Mastery",
  lectureTitle = "Lecture 01: Attention Mechanisms & Transformer Foundations",
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
              <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                AI Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[280px] sm:max-w-md">
              {courseTitle} &bull; <span className="text-slate-700 font-medium">{lectureTitle}</span>
            </p>
          </div>
        </div>

        {/* Live Knowledge Boundary & Progress Stats */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Active Knowledge Boundary Badge */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-700">
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
          <div className="flex items-center gap-2 min-w-[100px]">
            <div className="text-right">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Progress</div>
              <div className="text-xs font-bold text-slate-800">{progressPercent}%</div>
            </div>
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
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
