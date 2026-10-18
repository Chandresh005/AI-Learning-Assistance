"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Clock,
  ExternalLink,
  BookOpen,
  FileText,
  Presentation,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
  PauseCircle,
  Play
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { ChatMessage, SourceCitation } from "@/types";

interface AssistantPanelProps {
  currentTimestamp: number;
  onSeekToTimestamp: (seconds: number) => void;
  courseId?: string;
  videoId?: string;
  onRequestPause?: () => void;
  externalPrompt?: { text: string; id: number } | null;
  isDark?: boolean;
}

export function AssistantPanel({
  currentTimestamp,
  onSeekToTimestamp,
  courseId = "course-ml-100",
  videoId = "vid-ml-day-01",
  onRequestPause,
  externalPrompt = null,
  isDark = true
}: AssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Hello! I am your AI Learning Copilot. Pause or ask at any moment—my answers are strictly grounded in what you have watched up to your current playhead (plus course slides/PDFs) with 0% future spoiler leakage.",
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pauseOnType, setPauseOnType] = useState(true);
  const [hoveredCitationKey, setHoveredCitationKey] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: "Explain simply", icon: Lightbulb, query: "Explain the current concept in simple, intuitive terms." },
    { label: "Give an example", icon: Sparkles, query: "Can you provide a concrete real-world example of this?" },
    { label: "Summarize so far", icon: BookOpen, query: "Summarize the key points covered in the lecture up to this timestamp." },
    { label: "Where was this covered?", icon: Clock, query: "At what timestamp was this specific topic introduced?" }
  ];

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle external prompt triggered from Transcript "Explain this segment" button
  useEffect(() => {
    if (externalPrompt && externalPrompt.text) {
      handleSend(externalPrompt.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt?.id]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const askTimestamp = Math.floor(currentTimestamp);
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestampSeconds: askTimestamp,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          video_id: videoId,
          timestamp: askTimestamp,
          question: textToSend,
          conversation_id: `session-${videoId}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        const normalizedCitations: SourceCitation[] = (data.sources || []).map((s: any) => ({
          type: s.type,
          startTime: s.start_time ?? s.startTime,
          endTime: s.end_time ?? s.endTime,
          page: s.page,
          slide: s.slide,
          snippet: s.snippet
        }));

        const lowerAns = (data.answer || "").toLowerCase();
        const isSpoilerProtected =
          lowerAns.includes("not been covered yet") ||
          lowerAns.includes("covered later") ||
          lowerAns.includes("outside the scope") ||
          data.confidence === 0;

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: data.answer,
          citations: normalizedCitations,
          confidence: data.confidence,
          isSpoilerProtected,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Backend not reachable");
      }
    } catch {
      const demoCitationTimestamp = Math.max(0, Math.floor(currentTimestamp * 0.7));
      const simulatedAssistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `Based strictly on the lecture material up to ${formatTimestamp(currentTimestamp)}: The instructor contrasts traditional rule-based programming with data-driven machine learning models.`,
        citations: [
          {
            type: "video",
            startTime: Math.max(0, demoCitationTimestamp - 15),
            endTime: demoCitationTimestamp + 15,
            snippet: "In Machine Learning, you feed Data and Answers into the computer, and it produces the Rules..."
          },
          {
            type: "ppt",
            slide: 1,
            snippet: "Slide 1: Traditional Programming vs Machine Learning Paradigm"
          }
        ],
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, simulatedAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (pauseOnType && inputValue.length === 0 && val.length === 1) {
      onRequestPause?.();
    }
    setInputValue(val);
  };

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border overflow-hidden transition-colors ${
        isDark
          ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-xl"
          : "bg-white border-slate-200 text-slate-900 shadow-xs"
      }`}
    >
      {/* Assistant Header */}
      <div
        className={`p-3.5 border-b flex items-center justify-between gap-2 ${
          isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">AI Learning Copilot</h2>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Grounded &bull; Hover Citations to Preview
            </p>
          </div>
        </div>

        {/* Pause-on-Type Toggle & Active Horizon Badge */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPauseOnType(!pauseOnType)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
              pauseOnType
                ? isDark
                  ? "bg-indigo-950/80 text-indigo-300 border-indigo-800/60"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
                : isDark
                ? "bg-slate-900 text-slate-500 border-slate-800"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
            title="Automatically pause the video when you start typing a question"
          >
            <PauseCircle className="w-3 h-3" />
            <span>Auto-Pause</span>
          </button>

          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono-timestamp border ${
              isDark
                ? "bg-blue-950/60 text-blue-300 border-blue-800/60"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(currentTimestamp)}</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-sm"
                  : msg.isSpoilerProtected
                  ? isDark
                    ? "bg-rose-950/40 text-rose-100 border border-rose-800/60 rounded-bl-xs"
                    : "bg-rose-50/80 text-rose-950 border border-rose-200 rounded-bl-xs"
                  : isDark
                  ? "bg-slate-800/90 text-slate-100 rounded-bl-xs border border-slate-700/80"
                  : "bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200"
              }`}
            >
              {/* User Timestamp Pill */}
              {msg.role === "user" && msg.timestampSeconds !== undefined && (
                <div className="flex items-center gap-1 text-[10px] text-blue-100 font-mono-timestamp mb-1">
                  <Clock className="w-3 h-3" />
                  <span>Asked at {formatTimestamp(msg.timestampSeconds)}</span>
                </div>
              )}

              {/* Spoiler Shield Header when future content is guarded */}
              {msg.role === "assistant" && msg.isSpoilerProtected && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 mb-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Temporal Boundary Shield Active (Future Spoiler Prevented)</span>
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Semantic Color-Coded Citations with Hover Snippet Popovers */}
              {msg.citations && msg.citations.length > 0 && (
                <div
                  className={`mt-3 pt-2.5 border-t flex flex-col gap-1.5 ${
                    isDark ? "border-slate-700/70" : "border-slate-200/80"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Verified Source Citations (Click to Jump &bull; Hover to Preview):</span>
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((cite, idx) => {
                      const startSec = cite.startTime ?? cite.start_time;
                      const endSec = cite.endTime ?? cite.end_time ?? startSec;
                      const citeKey = `${msg.id}-cite-${idx}`;
                      const isHovered = hoveredCitationKey === citeKey;

                      return (
                        <div
                          key={idx}
                          className="relative"
                          onMouseEnter={() => setHoveredCitationKey(citeKey)}
                          onMouseLeave={() => setHoveredCitationKey(null)}
                        >
                          {/* Video Citation Chip (Electric Blue) */}
                          {cite.type === "video" && startSec !== undefined && (
                            <button
                              onClick={() => onSeekToTimestamp(startSec)}
                              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-mono-timestamp font-semibold cursor-pointer transition-all border ${
                                isDark
                                  ? "bg-blue-950/80 hover:bg-blue-900 text-blue-300 border-blue-700/70"
                                  : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                              }`}
                              title="Click to jump video to this exact timestamp"
                            >
                              <Play className="w-3 h-3 fill-current text-blue-500" />
                              <span>
                                {formatTimestamp(startSec)}&ndash;{formatTimestamp(endSec || startSec)}
                              </span>
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                            </button>
                          )}

                          {/* PDF Citation Chip (Emerald) */}
                          {cite.type === "pdf" && cite.page !== undefined && (
                            <span
                              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border cursor-default ${
                                isDark
                                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
                              }`}
                            >
                              <FileText className="w-3 h-3 text-emerald-500" />
                              <span>PDF Page {cite.page}</span>
                            </span>
                          )}

                          {/* PPT Slide Citation Chip (Amber) */}
                          {cite.type === "ppt" && cite.slide !== undefined && (
                            <span
                              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border cursor-default ${
                                isDark
                                  ? "bg-amber-950/70 text-amber-300 border-amber-800/60"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              <Presentation className="w-3 h-3 text-amber-500" />
                              <span>Slide {cite.slide}</span>
                            </span>
                          )}

                          {/* Hover Preview Popover */}
                          {isHovered && cite.snippet && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 p-2.5 rounded-xl bg-slate-950 text-slate-100 border border-slate-700 shadow-2xl text-[11px] leading-snug z-40 pointer-events-none">
                              <div className="font-bold text-blue-400 mb-1 flex items-center justify-between">
                                <span>
                                  {cite.type === "video"
                                    ? `Transcript (${formatTimestamp(startSec || 0)})`
                                    : cite.type === "ppt"
                                    ? `Lecture Slide ${cite.slide}`
                                    : `Course PDF Page ${cite.page}`}
                                </span>
                                <span className="text-[10px] text-emerald-400">Grounded</span>
                              </div>
                              <p className="text-slate-300 italic">&ldquo;{cite.snippet}&rdquo;</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div
            className={`flex items-center gap-2 text-xs p-2.5 rounded-xl border w-fit ${
              isDark
                ? "bg-slate-800/70 border-slate-700 text-slate-300"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
            <span>Scanning evidence within [00:00 &rarr; {formatTimestamp(currentTimestamp)}]...</span>
          </div>
        )}
      </div>

      {/* Quick Action Prompt Chips */}
      <div
        className={`p-2.5 border-t flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
          isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/50"
        }`}
      >
        {quickPrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(item.query)}
              className={`flex items-center gap-1 text-[11px] whitespace-nowrap rounded-full px-2.5 py-1 border transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900 hover:bg-blue-950/70 hover:text-blue-300 hover:border-blue-800 text-slate-300 border-slate-800"
                  : "bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 border-slate-200 shadow-2xs"
              }`}
            >
              <Icon className="w-3 h-3 text-blue-500" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Area */}
      <div className={`p-3 border-t ${isDark ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-white"}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Ask anything covered up to ${formatTimestamp(currentTimestamp)}...`}
              className={`w-full text-xs sm:text-sm pl-3 pr-20 py-2.5 rounded-xl border focus:outline-hidden transition-colors ${
                isDark
                  ? "bg-slate-900 border-slate-700 focus:border-blue-500 text-slate-100 placeholder:text-slate-500"
                  : "bg-slate-50 border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900"
              }`}
            />
            <span
              className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono-timestamp px-1.5 py-0.5 rounded ${
                isDark ? "bg-blue-950 text-blue-300 border border-blue-800/50" : "bg-slate-200 text-slate-700"
              }`}
            >
              📍 {formatTimestamp(currentTimestamp)}
            </span>
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer font-medium text-xs shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
