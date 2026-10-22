"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Play,
  Pause,
  ShieldCheck,
  Clock3,
  Sparkles,
  FileText,
  Presentation,
  BookOpen,
  Mic,
  CheckCircle2,
  Lock,
  ArrowRight,
  Search,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Layers,
  Brain,
  ClipboardCheck,
  Video,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { AuthUser, getStoredSession, setStoredSession } from "@/lib/auth";
import {
  DEFAULT_PLAYLIST,
  LearningStudioWorkspace
} from "@/components/studio/LearningStudioWorkspace";

interface DemoScenario {
  id: string;
  label: string;
  timestamp: number;
  question: string;
  answer: string;
  videoCite: string;
  pdfCite: string;
  pptCite: string;
  blockedTopic: string;
}

const HERO_DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "early",
    label: "Paused @ 02:45 — Paradigm Shift",
    timestamp: 165,
    question: "How is Machine Learning fundamentally different from Traditional Programming?",
    answer:
      "In Traditional Programming, engineers write explicit rules that process input data to produce answers. In Machine Learning, you feed historical Data and expected Answers into the learning algorithm, and the computer automatically infers the underlying Rules (Model).",
    videoCite: "Video 01:15–02:45",
    pdfCite: "Lecture01_Notes.pdf p.2",
    pptCite: "Day01_Deck.pptx Slide 3",
    blockedTopic: "Tom Mitchell's E-T-P Framework (05:30) & MLDLC Phases (13:20) are strictly locked beyond 02:45."
  },
  {
    id: "mid",
    label: "Paused @ 07:45 — Tom Mitchell E-T-P",
    timestamp: 465,
    question: "Explain Tom Mitchell's operational definition of Machine Learning with the spam filter example.",
    answer:
      "Professor Tom Mitchell (1997) defines that a program learns from Experience (E) with respect to Task (T) and Performance measure (P) if its performance at T, as measured by P, improves with E. For an email classifier: T is classifying spam, E is labeled training emails, and P is classification accuracy.",
    videoCite: "Video 05:30–07:45",
    pdfCite: "Lecture01_Notes.pdf p.5",
    pptCite: "Day01_Deck.pptx Slide 7",
    blockedTopic: "ML Development Life Cycle (13:20) & Real-World Applications (16:00) remain locked beyond 07:45."
  },
  {
    id: "late",
    label: "Paused @ 15:40 — Full MLDLC Horizon",
    timestamp: 940,
    question: "What are the sequential engineering stages in the Machine Learning Development Life Cycle (MLDLC)?",
    answer:
      "The MLDLC progresses through Problem Framing, Data Gathering, Data Preprocessing & Cleaning, Exploratory Data Analysis (EDA), Feature Engineering & Selection, Model Training, Evaluation, Hyperparameter Tuning, Deployment, and Continuous Monitoring.",
    videoCite: "Video 13:20–15:40",
    pdfCite: "Lecture01_Notes.pdf p.9",
    pptCite: "Day01_Deck.pptx Slide 12",
    blockedTopic: "Wrap-up & Day 2 Deep Learning preview (18:20–20:00) locked beyond 15:40."
  }
];

export default function HomePage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeStudioView, setActiveStudioView] = useState<{
    open: boolean;
    dayIndex: number;
    customUrl?: string;
  }>({ open: false, dayIndex: 0 });

  // Interactive Hero Horizon State
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(1);
  const activeScenario = HERO_DEMO_SCENARIOS[selectedScenarioIdx];

  // Curriculum Filter & Custom YouTube Loader State
  const [courseFilter, setCourseFilter] = useState<"all" | "indexed">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [quickYoutubeUrl, setQuickYoutubeUrl] = useState<string>("");

  useEffect(() => {
    const syncAuth = () => {
      const session = getStoredSession();
      setUser(session?.user || null);
    };
    syncAuth();
    window.addEventListener("ila-auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("ila-auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const handleSignOut = () => {
    setStoredSession(null);
    setUser(null);
  };

  const handleLaunchLecture = (dayIndex: number) => {
    setActiveStudioView({ open: true, dayIndex });
  };

  const handleLaunchCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickYoutubeUrl.trim()) return;
    setActiveStudioView({
      open: true,
      dayIndex: 0,
      customUrl: quickYoutubeUrl.trim()
    });
  };

  // If the user switches inline into the Studio workspace, render it with a back-to-home handler
  if (activeStudioView.open) {
    return (
      <LearningStudioWorkspace
        initialDayIndex={activeStudioView.dayIndex}
        initialCustomUrl={activeStudioView.customUrl}
        onBackToHome={() => setActiveStudioView({ open: false, dayIndex: 0 })}
      />
    );
  }

  const filteredPlaylist = DEFAULT_PLAYLIST.filter((item) => {
    if (courseFilter === "indexed" && !item.hasTranscripts) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary?.toLowerCase().includes(q);
      const matchTopics = item.topics?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchSummary || matchTopics;
    }
    return true;
  });

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isDark ? "bg-[#0B0F19] text-slate-100" : "bg-[#F7F9FC] text-slate-900"
      }`}
    >
      {/* Top Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
          isDark
            ? "bg-slate-950/85 border-slate-800/80 text-slate-100"
            : "bg-white/90 border-slate-200 text-slate-900 shadow-2xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base sm:text-lg">
                  Intelligent Learning Studio
                </span>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isDark
                      ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/60"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>0% Spoiler RAG</span>
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Context-Aware Video, PDF & Slide Copilot
              </p>
            </div>
          </div>

          {/* Center Anchor Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <a
              href="#interactive-demo"
              className={`transition-colors ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Live Horizon Demo
            </a>
            <a
              href="#curriculum"
              className={`transition-colors ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Course Curriculum (10)
            </a>
            <a
              href="#architecture"
              className={`transition-colors ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              System Architecture
            </a>
            <Link
              href="/jev"
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>JEV Audit Center</span>
            </Link>
            <button
              onClick={() => handleLaunchLecture(0)}
              className="text-blue-500 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
            >
              <span>Studio Workspace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              title={isDark ? "Switch to Light Theme" : "Switch to Cinema Dark Theme"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div
                className={`flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-xl border text-xs ${
                  isDark
                    ? "bg-slate-900 border-slate-800 text-slate-200"
                    : "bg-slate-100 border-slate-200 text-slate-800"
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-[11px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-semibold max-w-[120px] truncate">
                  {user.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200"
                    : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-blue-500" />
                <span>Sign In</span>
              </Link>
            )}

            <button
              onClick={() => handleLaunchLecture(0)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Studio</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 border-b border-slate-800/60">
          {/* Background Subtle Glow */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-indigo-600/15 blur-3xl rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: Hero Value Proposition & Learning Loop */}
              <div className="lg:col-span-6 space-y-6">
                {user && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Welcome back, {user.name} &bull; Ready to resume Day 01</span>
                  </div>
                )}

                {/* Signature Learning Loop Pill */}
                <div
                  className={`inline-flex flex-wrap items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border text-[11px] font-bold tracking-wide ${
                    isDark
                      ? "bg-slate-900/90 border-slate-800 text-blue-400"
                      : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>WATCH</span>
                  <span className="opacity-50">&rarr;</span>
                  <span>PAUSE</span>
                  <span className="opacity-50">&rarr;</span>
                  <span>ASK</span>
                  <span className="opacity-50">&rarr;</span>
                  <span>UNDERSTAND</span>
                  <span className="opacity-50">&rarr;</span>
                  <span className="text-emerald-400">CONTINUE</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12]">
                  Ask about what you&apos;re learning{" "}
                  <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                    right now
                  </span>{" "}
                  — and see where every answer came from.
                </h1>

                <p
                  className={`text-sm sm:text-base leading-relaxed max-w-xl ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Traditional AI chatbots spoil future lecture topics or hallucinate unverified claims.{" "}
                  <strong className={isDark ? "text-white" : "text-slate-900"}>
                    Intelligent Learning Studio
                  </strong>{" "}
                  enforces a strict{" "}
                  <span className="font-mono-timestamp text-blue-400 font-semibold">
                    [00:00 &rarr; current_timestamp]
                  </span>{" "}
                  knowledge boundary across video transcripts, textbooks (PDF), slide decks (PPTX), and notes.
                </p>

                {/* Primary Hero CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => handleLaunchLecture(0)}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Enter Learning Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {!user ? (
                    <Link
                      href="/login"
                      className={`px-5 py-3.5 rounded-2xl border font-bold text-sm flex items-center gap-2 transition-colors ${
                        isDark
                          ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200"
                          : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-2xs"
                      }`}
                    >
                      <LogIn className="w-4 h-4 text-blue-500" />
                      <span>Sign In / Evaluator Demo</span>
                    </Link>
                  ) : (
                    <Link
                      href="/studio"
                      className={`px-5 py-3.5 rounded-2xl border font-bold text-sm flex items-center gap-2 transition-colors ${
                        isDark
                          ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200"
                          : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                      }`}
                    >
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                      <span>Open Fullscreen Route (/studio)</span>
                    </Link>
                  )}
                </div>

                {/* Key Metrics Bar */}
                <div
                  className={`grid grid-cols-3 gap-4 pt-4 border-t ${
                    isDark ? "border-slate-800/80" : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold font-mono-timestamp text-emerald-400">
                      0.0%
                    </div>
                    <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Future Spoiler Leakage
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold font-mono-timestamp text-blue-400">
                      4 Modalities
                    </div>
                    <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Video, PDF, PPTX & Notes
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold font-mono-timestamp text-cyan-400">
                      100% Cited
                    </div>
                    <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Clickable Timestamp Chips
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Timestamp Horizon Simulator */}
              <div id="interactive-demo" className="lg:col-span-6">
                <div
                  className={`rounded-3xl border p-5 sm:p-6 shadow-2xl transition-all ${
                    isDark
                      ? "bg-slate-900/90 border-slate-800 text-slate-100"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  {/* Top Simulator Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800/70">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                        Interactive Timestamp-Enforced RAG Simulator
                      </span>
                    </div>
                    <span className="font-mono-timestamp text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/30">
                      Horizon: 00:00 &rarr; {formatTimestamp(activeScenario.timestamp)}
                    </span>
                  </div>

                  {/* Step 1: Select Playhead Timestamp */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className={isDark ? "text-slate-400 font-medium" : "text-slate-600 font-medium"}>
                        1. Click a playhead pause point to test knowledge gating:
                      </span>
                      <span className="font-mono-timestamp text-[11px] text-emerald-400 font-semibold">
                        {formatTimestamp(activeScenario.timestamp)} / 20:00
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {HERO_DEMO_SCENARIOS.map((scen, idx) => {
                        const active = idx === selectedScenarioIdx;
                        return (
                          <button
                            key={scen.id}
                            type="button"
                            onClick={() => setSelectedScenarioIdx(idx)}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              active
                                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20"
                                : isDark
                                ? "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono-timestamp font-bold">
                              <span>⏸ {formatTimestamp(scen.timestamp)}</span>
                              {active && <span className="text-[10px] bg-white/20 px-1.5 rounded">Active</span>}
                            </div>
                            <div className="text-[11px] truncate mt-1 opacity-90">
                              {scen.label.split("—")[1]}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Visual Progress Scrubber Bar */}
                    <div className="mt-3 relative h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.round((activeScenario.timestamp / 1200) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono-timestamp text-slate-400 mt-1">
                      <span className="text-emerald-400 font-semibold">
                        ✔ Unlocked Video Evidence [00:00 &rarr; {formatTimestamp(activeScenario.timestamp)}]
                      </span>
                      <span className="text-rose-400 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Locked [{formatTimestamp(activeScenario.timestamp)} &rarr; 20:00]
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Simulated Learner Question & Grounded Answer */}
                  <div
                    className={`mt-4 p-4 rounded-2xl border space-y-3 ${
                      isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold shrink-0">
                        You Ask
                      </span>
                      <p className="text-xs sm:text-sm font-semibold">
                        &ldquo;{activeScenario.question}&rdquo;
                      </p>
                    </div>

                    <div
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                        isDark
                          ? "bg-slate-900/90 border-slate-800 text-slate-200"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-blue-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI Copilot (Grounded in 3 Sources)
                        </span>
                        <span className="text-[10px] font-mono-timestamp text-emerald-400 font-semibold">
                          Confidence: High
                        </span>
                      </div>
                      <p>{activeScenario.answer}</p>

                      {/* Actionable Citation Chips */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleLaunchLecture(0)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-mono-timestamp text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          {activeScenario.videoCite}
                        </button>
                        <button
                          onClick={() => handleLaunchLecture(0)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          {activeScenario.pdfCite}
                        </button>
                        <button
                          onClick={() => handleLaunchLecture(0)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Presentation className="w-3 h-3" />
                          {activeScenario.pptCite}
                        </button>
                      </div>
                    </div>

                    {/* Zero-Leakage Spoiler Shield Notice */}
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px]">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span>{activeScenario.blockedTopic}</span>
                      </div>
                      <button
                        onClick={() => handleLaunchLecture(0)}
                        className="shrink-0 font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                      >
                        Try Live &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Custom YouTube Loader Bar */}
            <div
              className={`mt-12 p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                isDark
                  ? "bg-slate-900/75 border-slate-800"
                  : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    Study Any YouTube Lecture or Course URL Inside the Studio
                  </h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Paste any educational YouTube link to launch the synchronized video player, notes, and AI copilot.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLaunchCustomUrl} className="w-full md:w-auto flex gap-2">
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={quickYoutubeUrl}
                  onChange={(e) => setQuickYoutubeUrl(e.target.value)}
                  className={`flex-1 md:w-80 px-3.5 py-2 rounded-xl border text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open in Studio</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Course Curriculum Section */}
        <section id="curriculum" className="py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Featured Course Curriculum</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                100 Days of Machine Learning &bull; CampusX
              </h2>
              <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Select any lecture module below to launch the 3-zone Learning Studio with synchronized transcripts, PDFs, slides, and quizzes.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`flex p-1 rounded-xl border text-xs font-semibold ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
                }`}
              >
                <button
                  onClick={() => setCourseFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    courseFilter === "all"
                      ? "bg-blue-600 text-white"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Lectures (10)
                </button>
                <button
                  onClick={() => setCourseFilter("indexed")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    courseFilter === "indexed"
                      ? "bg-blue-600 text-white"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ✔ RAG Indexed (3)
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topics (e.g. MLDLC, KNN)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-8 pr-3 py-2 rounded-xl border text-xs w-56 focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Lecture Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlaylist.map((item) => {
              const originalIndex = DEFAULT_PLAYLIST.findIndex((p) => p.id === item.id);
              return (
                <div
                  key={item.id}
                  className={`group rounded-2xl border p-5 flex flex-col justify-between transition-all hover:-translate-y-0.5 ${
                    isDark
                      ? "bg-slate-900/75 hover:bg-slate-900 border-slate-800 hover:border-blue-500/50"
                      : "bg-white hover:bg-blue-50/20 border-slate-200 hover:border-blue-400 shadow-xs"
                  }`}
                >
                  <div>
                    {/* Top Meta Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/30 font-mono-timestamp text-xs font-bold">
                        Day {String(item.day).padStart(2, "0")}
                      </span>

                      <div className="flex items-center gap-2">
                        {item.hasTranscripts ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            RAG Indexed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Stream Ready
                          </span>
                        )}
                        <span className="font-mono-timestamp text-xs text-slate-400 flex items-center gap-1">
                          <Clock3 className="w-3 h-3" />
                          {formatTimestamp(item.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <h3 className="font-bold text-base leading-snug group-hover:text-blue-400 transition-colors">
                      {item.title.replace(/ \| 100 Days of Machine Learning/i, "")}
                    </h3>
                    <p
                      className={`text-xs mt-2 leading-relaxed line-clamp-2 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {item.summary}
                    </p>

                    {/* Concept Tags */}
                    {item.topics && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.topics.map((topic) => (
                          <span
                            key={topic}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                              isDark
                                ? "bg-slate-950 border-slate-800 text-slate-300"
                                : "bg-slate-100 border-slate-200 text-slate-700"
                            }`}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Launch Action Footer */}
                  <div className="mt-5 pt-3.5 border-t border-slate-800/60 flex items-center justify-between">
                    <button
                      onClick={() => handleLaunchLecture(originalIndex >= 0 ? originalIndex : 0)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch &amp; Ask in Studio</span>
                    </button>

                    <Link
                      href={`/studio?day=${item.day}`}
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                      }`}
                      title="Open dedicated /studio URL"
                    >
                      <span>/studio?day={item.day}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* System Architecture & Core Pillars Bento Section */}
        <section
          id="architecture"
          className={`py-14 sm:py-16 border-t ${
            isDark ? "bg-slate-950/50 border-slate-800/80" : "bg-slate-100/70 border-slate-200"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                <Layers className="w-4 h-4" />
                <span>Production RAG Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Built for Evidence-Grounded Academic Mastery
              </h2>
              <p className={`text-xs sm:text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Every layer of the stack is engineered around the core invariant: never expose future lecture spoilers, and always cite the exact timestamp, page, or slide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Timestamp-Enforced Guard</h3>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  SQL &amp; vector retrieval strictly enforces{" "}
                  <code className="font-mono-timestamp text-emerald-400">end_time &lt;= current_timestamp</code>{" "}
                  so pausing at 18:42 never leaks concepts from 42:10.
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Multi-Resource Synthesis</h3>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Combines Whisper video transcripts with PyMuPDF textbook pages, python-pptx slide decks, and learner notes in one unified query.
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Horizon-Gated Quizzes</h3>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Generates active-recall checkpoints strictly from concepts covered up to your current playhead, complete with explanations and source links.
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">AI Mock Interviewer</h3>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Practice technical viva &amp; job interview questions grounded in the lectures you&apos;ve watched, with rubric scoring and feedback.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-8 text-xs ${
          isDark
            ? "bg-slate-950 border-slate-800/80 text-slate-400"
            : "bg-white border-slate-200 text-slate-600"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-200">Intelligent Learning Studio</span>
            <span>&bull;</span>
            <span>Timestamp-Enforced Educational RAG</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => handleLaunchLecture(0)}
              className="hover:text-blue-400 font-semibold cursor-pointer"
            >
              Launch Studio
            </button>
            <Link href="/studio" className="hover:text-blue-400 font-semibold">
              /studio
            </Link>
            <Link href="/login" className="hover:text-blue-400 font-semibold">
              Sign In (/login)
            </Link>
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-400 font-semibold"
            >
              API Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
