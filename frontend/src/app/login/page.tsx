"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  Clock3,
  FileText,
  Presentation,
  Play,
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Home,
  Mic,
  BookOpen
} from "lucide-react";
import {
  loginWithCredentials,
  registerUserAccount,
  loginWithDemoRole
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isDark, setIsDark] = useState<boolean>(true);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("alex.rivera@stanford.edu");
  const [password, setPassword] = useState<string>("demo1234");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const session = await loginWithCredentials(email, password);
        setSuccessMessage(`Welcome back, ${session.user.name}! Entering Learning Studio...`);
      } else {
        if (!name.trim()) {
          throw new Error("Please enter your full name.");
        }
        const session = await registerUserAccount(name, email, password);
        setSuccessMessage(`Account created for ${session.user.name}! Redirecting...`);
      }
      setTimeout(() => {
        router.push("/studio");
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async (demoRole: "student" | "instructor") => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const session = await loginWithDemoRole(demoRole);
      setEmail(session.user.email);
      setSuccessMessage(`Signed in as ${session.user.name}. Launching Studio...`);
      setTimeout(() => {
        router.push("/studio");
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo login failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row transition-colors ${
        isDark ? "bg-[#0B0F19] text-slate-100" : "bg-[#F7F9FC] text-slate-900"
      }`}
    >
      {/* Left Showcase Column: Intelligent Learning Studio Identity & Live Evidence Preview */}
      <div
        className={`lg:w-7/12 xl:w-1/2 relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r ${
          isDark
            ? "bg-gradient-to-br from-slate-950 via-[#0D1425] to-indigo-950/40 border-slate-800/80"
            : "bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white border-slate-200"
        }`}
      >
        {/* Ambient Decorative Glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Top Bar: Brand + Home Link */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Intelligent Learning Studio
                </span>
                <span className="text-[10px] font-mono-timestamp uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  v2.0 RAG
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Timestamp-Enforced Multimodal Educational Copilot
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-blue-400" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Center Narrative & Interactive Architecture Card */}
        <div className="relative z-10 my-8 lg:my-auto max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WATCH &rarr; PAUSE &rarr; ASK &rarr; UNDERSTAND &rarr; CONTINUE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Ask about what you are learning right now —{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              with zero future spoilers.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            When you pause a lecture at <span className="font-mono-timestamp text-blue-300 font-semibold">07:45</span>, our retrieval engine strictly filters video transcripts to{" "}
            <span className="font-mono-timestamp text-emerald-400 font-semibold">[00:00 &rarr; 07:45]</span> and cross-references your course PDFs, slides, and notes with verifiable one-click citations.
          </p>

          {/* Live Horizon Guard Preview Widget */}
          <div className="mt-7 rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Clock3 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Active Knowledge Boundary
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono-timestamp text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-950 text-blue-400 border border-blue-900/60">
                  00:00 &rarr; 07:45
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  0% Leakage
                </span>
              </div>
            </div>

            {/* Simulated Question & Grounded Response */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold shrink-0">
                  Learner @ 07:45
                </span>
                <p className="text-slate-300 italic">
                  &ldquo;How does Tom Mitchell define Machine Learning using E, T, and P?&rdquo;
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 leading-relaxed">
                <p>
                  Professor Tom Mitchell (1997) defines that a program learns from{" "}
                  <strong className="text-white">Experience (E)</strong> with respect to{" "}
                  <strong className="text-white">Task (T)</strong> and{" "}
                  <strong className="text-white">Performance measure (P)</strong> if its performance on T, measured by P, improves with experience E.
                </p>

                {/* Citation Chips */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/60 font-mono-timestamp text-[11px]">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    Video 05:30–07:45
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[11px]">
                    <FileText className="w-3 h-3" />
                    ML_Foundations.pdf p.4
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[11px]">
                    <Presentation className="w-3 h-3" />
                    Day01_Slides.pptx #7
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Feature Pills */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Spoiler-Free RAG</div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Strict SQL & vector cutoff at your playhead.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Multi-Resource</div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Videos, PDFs, PPTs, and personal notes unified.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
              <Mic className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">AI Mock Interview</div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Oral & written viva on watched concepts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/60">
          <span>Intelligent Learning Studio &bull; Academic Edition</span>
          <span className="font-mono-timestamp text-[11px] text-slate-500">
            FastAPI + Next.js + Hybrid RAG
          </span>
        </div>
      </div>

      {/* Right Authentication Column */}
      <div className="lg:w-5/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12">
        {/* Top Utility Controls */}
        <div className="flex items-center justify-end gap-2.5">
          <Link
            href="/studio"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Continue as Guest &rarr;
          </Link>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Auth Form Container */}
        <div className="w-full max-w-md mx-auto my-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {mode === "signin" ? "Sign in to your Studio" : "Create your Learner Account"}
            </h2>
            <p className={`text-xs sm:text-sm mt-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {mode === "signin"
                ? "Sync your watch horizon, timestamped notes, quiz mastery, and AI interview history."
                : "Start learning with timestamp-enforced AI grounding and interactive citations."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            className={`grid grid-cols-2 p-1 rounded-xl border mb-6 ${
              isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-200/70 border-slate-300/80"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Instant 1-Click Demo Access Section */}
          <div
            className={`p-3.5 rounded-2xl border mb-6 ${
              isDark
                ? "bg-blue-950/25 border-blue-900/50"
                : "bg-blue-50/80 border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Instant Evaluator / Demo Sign-In
              </span>
              <span className="text-[10px] font-mono-timestamp text-emerald-400 font-semibold">
                1-Click Access
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoAccess("student")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isDark
                    ? "bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200"
                    : "bg-white hover:bg-blue-50 border-slate-200 text-slate-800 shadow-2xs"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Alex Rivera</div>
                  <div className="text-[10px] text-slate-400 truncate">Student &bull; ML Cohort</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoAccess("instructor")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isDark
                    ? "bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200"
                    : "bg-white hover:bg-blue-50 border-slate-200 text-slate-800 shadow-2xs"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Prof. Nitish Singh</div>
                  <div className="text-[10px] text-slate-400 truncate">Instructor &bull; CampusX</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all ${
                      isDark
                        ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                        : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5">Academic or Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDark
                      ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold">Password</label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("alex.rivera@stanford.edu");
                      setPassword("demo1234");
                      setSuccessMessage("Demo credentials autofilled. Click Sign In below!");
                    }}
                    className="text-[11px] text-blue-500 hover:text-blue-400 font-semibold cursor-pointer"
                  >
                    Fill Demo Credentials
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDark
                      ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold mb-1.5">Primary Learning Track</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      role === "student"
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : isDark
                        ? "bg-slate-900 border-slate-800 text-slate-400"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    🎓 Student / Self-Learner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("instructor")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      role === "instructor"
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : isDark
                        ? "bg-slate-900 border-slate-800 text-slate-400"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    🔬 Instructor / Researcher
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                  Keep my study session active
                </span>
              </label>
              <span className="font-mono-timestamp text-[11px] text-emerald-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                JWT Secured
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In & Launch Studio" : "Create Account & Start Learning"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Help Link */}
        <div className="text-center text-xs text-slate-500">
          Want to explore immediately without signing in?{" "}
          <Link href="/studio" className="text-blue-500 hover:text-blue-400 font-semibold underline">
            Open the Interactive Studio directly
          </Link>
        </div>
      </div>
    </div>
  );
}
