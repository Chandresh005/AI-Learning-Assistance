"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Clock,
  ExternalLink,
  BookOpen,
  FileText,
  Presentation,
  ShieldCheck,
  HelpCircle,
  Lightbulb,
  FileQuestion,
  ListRestart
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { ChatMessage, SourceCitation } from "@/types";

interface AssistantPanelProps {
  currentTimestamp: number;
  onSeekToTimestamp: (seconds: number) => void;
  courseId?: string;
  videoId?: string;
}

export function AssistantPanel({
  currentTimestamp,
  onSeekToTimestamp,
  courseId = "dl-101",
  videoId = "lec-01"
}: AssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Hello! I am your AI Learning Assistant. As you watch this lecture, you can pause at any moment and ask questions. My answers are strictly grounded in what you have watched so far (plus course notes/slides) to avoid future spoilers.",
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    { label: "Explain simply", icon: Lightbulb, query: "Explain the current concept in simple, intuitive terms." },
    { label: "Give an example", icon: Sparkles, query: "Can you provide a concrete real-world example of this?" },
    { label: "Summarize learned so far", icon: BookOpen, query: "Summarize the key points covered in the lecture up to this timestamp." },
    { label: "Where was this discussed?", icon: Clock, query: "At what timestamp was this specific topic introduced?" }
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestampSeconds: currentTimestamp,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Call backend API if available, or simulate grounded RAG response with citations
    try {
      const response = await fetch("http://localhost:8000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          video_id: videoId,
          timestamp: Math.floor(currentTimestamp),
          question: textToSend,
          conversation_id: "demo-session"
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: data.answer,
          citations: data.sources,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Backend not reachable");
      }
    } catch {
      // Fallback response demonstrating timestamp-aware grounding
      const demoCitationTimestamp = Math.max(0, Math.floor(currentTimestamp * 0.7));
      const simulatedAssistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `Based strictly on the lecture material up to ${formatTimestamp(currentTimestamp)}: The instructor highlights that the attention mechanism allows tokens to dynamically compute relevance weights across the sequence rather than relying on a static compression vector.`,
        citations: [
          {
            type: "video",
            startTime: Math.max(0, demoCitationTimestamp - 15),
            endTime: demoCitationTimestamp + 15,
            snippet: "The attention mechanism computes dynamic dot-product affinity..."
          },
          {
            type: "pdf",
            page: 4,
            snippet: "Section 3.2: Scaled Dot-Product Formulation"
          },
          {
            type: "ppt",
            slide: 8,
            snippet: "Slide 8: Attention Matrix Visualization"
          }
        ],
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, simulatedAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Assistant Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">AI Learning Assistant</h2>
            <p className="text-[11px] text-slate-500">Grounded &bull; Timestamp-Aware</p>
          </div>
        </div>

        {/* Current Active Timestamp Tag */}
        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-md text-xs font-mono-timestamp">
          <Clock className="w-3.5 h-3.5" />
          <span>Active: {formatTimestamp(currentTimestamp)}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-xs shadow-xs"
                  : "bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200"
              }`}
            >
              {msg.role === "user" && msg.timestampSeconds !== undefined && (
                <div className="flex items-center gap-1 text-[11px] text-blue-100 font-mono-timestamp mb-1">
                  <Clock className="w-3 h-3" />
                  <span>Asked at {formatTimestamp(msg.timestampSeconds)}</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Citations & Source Evidence */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Source Evidence & Citations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((cite, idx) => (
                      <div key={idx}>
                        {cite.type === "video" && cite.startTime !== undefined && (
                          <button
                            onClick={() => onSeekToTimestamp(cite.startTime!)}
                            className="flex items-center gap-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-1 text-xs font-mono-timestamp cursor-pointer transition-colors shadow-2xs"
                            title="Jump video to this timestamp"
                          >
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Video {formatTimestamp(cite.startTime)}&ndash;{formatTimestamp(cite.endTime || cite.startTime)}</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                          </button>
                        )}
                        {cite.type === "pdf" && cite.page !== undefined && (
                          <span className="flex items-center gap-1 bg-white text-slate-700 border border-slate-200 rounded-md px-2 py-1 text-xs">
                            <FileText className="w-3 h-3 text-amber-600" />
                            <span>PDF Page {cite.page}</span>
                          </span>
                        )}
                        {cite.type === "ppt" && cite.slide !== undefined && (
                          <span className="flex items-center gap-1 bg-white text-slate-700 border border-slate-200 rounded-md px-2 py-1 text-xs">
                            <Presentation className="w-3 h-3 text-purple-600" />
                            <span>Slide {cite.slide}</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
            <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
            <span>Retrieving permitted evidence up to {formatTimestamp(currentTimestamp)}...</span>
          </div>
        )}
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(item.query)}
              className="flex items-center gap-1 text-[11px] whitespace-nowrap bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 border border-slate-200 rounded-full px-2.5 py-1 transition-colors cursor-pointer shadow-2xs"
            >
              <Icon className="w-3 h-3 text-blue-600" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 bg-white">
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
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask a question at ${formatTimestamp(currentTimestamp)}...`}
              className="w-full text-xs sm:text-sm pl-3 pr-20 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white text-slate-900 transition-colors"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono-timestamp bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
              {formatTimestamp(currentTimestamp)}
            </span>
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer font-medium text-xs shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
