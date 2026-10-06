"use client";

import React, { useState } from "react";
import {
  FileText,
  Presentation,
  ClipboardCheck,
  BarChart3,
  Clock,
  Play,
  CheckCircle2,
  BookOpen,
  Download,
  AlertCircle
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { TranscriptChunk } from "@/types";

interface ContentTabsProps {
  currentTimestamp: number;
  duration: number;
  onSeekToTimestamp: (seconds: number) => void;
}

export function ContentTabs({
  currentTimestamp,
  duration,
  onSeekToTimestamp
}: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<"transcript" | "resources" | "quiz" | "progress">("transcript");

  // Sample transcript chunks for demonstration
  const sampleTranscripts: TranscriptChunk[] = [
    {
      id: "tc-1",
      startTime: 0,
      endTime: 45,
      text: "Welcome everyone to our lecture on Transformer Architectures and Attention Mechanisms. Today, we'll understand why recurrent models struggle with long sequences."
    },
    {
      id: "tc-2",
      startTime: 45,
      endTime: 120,
      text: "In traditional RNNs and LSTMs, information is squashed sequentially step-by-step into a hidden state vector. As sequence length grows, vanishing gradients and information bottlenecks occur."
    },
    {
      id: "tc-3",
      startTime: 120,
      endTime: 210,
      text: "The breakthrough idea of attention is simple: instead of forcing the entire history into a single vector, let the model look back across all past token representations simultaneously."
    },
    {
      id: "tc-4",
      startTime: 210,
      endTime: 320,
      text: "Mathematically, we define Queries, Keys, and Values. We compute the dot product between the Query and all Keys, scale by the square root of the key dimension, and apply a softmax function."
    },
    {
      id: "tc-5",
      startTime: 320,
      endTime: 450,
      text: "Multi-head attention takes this further by projecting queries, keys, and values into multiple representation subspaces, enabling the model to jointly attend to information from different representation positions."
    }
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 pt-2 gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 pb-3 pt-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "transcript"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-lg border-t border-x border-slate-200"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Interactive Transcript</span>
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-2 pb-3 pt-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "resources"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-lg border-t border-x border-slate-200"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Resources (PDF & PPT)</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 pb-3 pt-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "quiz"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-lg border-t border-x border-slate-200"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Practice Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab("progress")}
          className={`flex items-center gap-2 pb-3 pt-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "progress"
              ? "border-blue-600 text-blue-600 bg-white rounded-t-lg border-t border-x border-slate-200"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Learner Progress</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4 min-h-[220px]">
        {/* Transcript Tab */}
        {activeTab === "transcript" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Click any timestamp to seek video playback directly:</span>
              <span className="font-mono-timestamp text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                Active at {formatTimestamp(currentTimestamp)}
              </span>
            </div>

            <div className="space-y-2">
              {sampleTranscripts.map((chunk) => {
                const isActive =
                  currentTimestamp >= chunk.startTime && currentTimestamp <= chunk.endTime;
                const isPast = currentTimestamp > chunk.endTime;

                return (
                  <div
                    key={chunk.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm transition-all ${
                      isActive
                        ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-400/30"
                        : isPast
                        ? "bg-slate-50/50 border-slate-200 text-slate-700"
                        : "bg-white border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <button
                      onClick={() => onSeekToTimestamp(chunk.startTime)}
                      className={`flex items-center gap-1 font-mono-timestamp text-xs px-2 py-1 rounded-md cursor-pointer transition-colors shrink-0 ${
                        isActive
                          ? "bg-blue-600 text-white font-bold"
                          : "bg-slate-200/80 hover:bg-blue-100 text-slate-700"
                      }`}
                      title="Jump to this segment"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{formatTimestamp(chunk.startTime)}</span>
                    </button>
                    <p className="flex-1 leading-relaxed">{chunk.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-800">Attention_Is_All_You_Need.pdf</h4>
                <p className="text-xs text-slate-500 mt-0.5">Original Transformer Research Paper (15 pages)</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Ingested &amp; Indexed
                </span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Presentation className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-800">Lecture01_Transformers_Slides.pptx</h4>
                <p className="text-xs text-slate-500 mt-0.5">Lecture visual slides and diagrams (32 slides)</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Ingested &amp; Indexed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === "quiz" && (
          <div className="p-6 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Covered Concept Quiz Generation</h4>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Generates questions strictly based on lecture concepts and resources covered up to your current timestamp (00:00 &rarr; {formatTimestamp(currentTimestamp)}).
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs">
              Generate 3-Question Checkpoint Quiz
            </button>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] text-slate-500">Watch Percentage</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {duration > 0 ? Math.round((currentTimestamp / duration) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] text-slate-500">Current Position</span>
                <p className="text-lg font-bold text-blue-600 font-mono-timestamp mt-0.5">
                  {formatTimestamp(currentTimestamp)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] text-slate-500">Questions Asked</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">2</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] text-slate-500">Retention Score</span>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">94%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
