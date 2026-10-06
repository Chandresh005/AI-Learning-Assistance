"use client";

import React, { useState } from "react";
import { Header } from "@/components/header/Header";
import { VideoPlayer } from "@/components/video-player/VideoPlayer";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { ContentTabs } from "@/components/tabs/ContentTabs";

export default function LearningStudioPage() {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const handleTimeUpdate = (currentTime: number, totalDuration: number) => {
    setCurrentTimestamp(currentTime);
    if (totalDuration > 0) {
      setDuration(totalDuration);
    }
  };

  const handleSeekToTimestamp = (seconds: number) => {
    setCurrentTimestamp(seconds);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Application Header */}
      <Header
        currentTimestamp={currentTimestamp}
        duration={duration}
        courseTitle="Deep Learning & NLP Mastery"
        lectureTitle="Lecture 01: Attention Mechanisms & Transformer Foundations"
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Video Player & Context Tabs (7 cols on lg screens) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <VideoPlayer
              currentTimestamp={currentTimestamp}
              onTimeUpdate={handleTimeUpdate}
            />

            <ContentTabs
              currentTimestamp={currentTimestamp}
              duration={duration}
              onSeekToTimestamp={handleSeekToTimestamp}
            />
          </div>

          {/* Right Column: AI Learning Assistant Panel (5 cols on lg screens) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-20 h-[calc(100vh-6.5rem)]">
            <AssistantPanel
              currentTimestamp={currentTimestamp}
              onSeekToTimestamp={handleSeekToTimestamp}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
