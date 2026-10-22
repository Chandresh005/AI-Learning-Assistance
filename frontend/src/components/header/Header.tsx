"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock3,
  GraduationCap,
  ShieldCheck,
  ListVideo,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  LogIn,
  LogOut,
  UserRound
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { AuthUser, getStoredSession, setStoredSession } from "@/lib/auth";

function YouTubeIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
  isDark?: boolean;
  onToggleTheme?: () => void;
  isTheaterMode?: boolean;
  onToggleTheaterMode?: () => void;
  isSidebarPinned?: boolean;
  onToggleSidebarPin?: () => void;
  onBackToHome?: () => void;
}

export function Header({
  currentTimestamp,
  duration,
  courseTitle = "100 Days of Machine Learning | CampusX",
  lectureTitle = "Day 01: What is Machine Learning?",
  onTogglePlaylist,
  playlistCount = 10,
  isDark = true,
  onToggleTheme,
  isTheaterMode = false,
  onToggleTheaterMode,
  isSidebarPinned = true,
  onToggleSidebarPin,
  onBackToHome
}: HeaderProps) {
  const progressPercent = duration > 0 ? Math.min(100, Math.round((currentTimestamp / duration) * 100)) : 0;
  const [user, setUser] = useState<AuthUser | null>(null);

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

  return (
    <header
      className={`w-full border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${
        isDark
          ? "bg-slate-950/90 border-slate-800 text-slate-100"
          : "bg-white/95 border-slate-200 text-slate-900 shadow-xs"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle, Home Link & Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleSidebarPin && (
            <button
              onClick={onToggleSidebarPin}
              className={`hidden xl:flex items-center justify-center w-9 h-9 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title={isSidebarPinned ? "Collapse Course Roadmap Rail" : "Expand Course Roadmap Rail"}
            >
              {isSidebarPinned ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          )}

          {onBackToHome ? (
            <button
              onClick={onBackToHome}
              className={`flex items-center gap-1.5 px-2.5 h-9 rounded-xl border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title="Return to Home Page"
            >
              <Home className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Home</span>
            </button>
          ) : (
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-2.5 h-9 rounded-xl border text-xs font-semibold transition-colors shrink-0 ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title="Return to Home Page"
            >
              <Home className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base sm:text-lg truncate">
                Intelligent Learning Studio
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                  isDark
                    ? "bg-red-950/70 text-red-400 border-red-800/50"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                <YouTubeIcon className="w-2.5 h-2.5 fill-current" />
                <span>YouTube Sync</span>
              </span>
            </div>
            <p className={`text-xs truncate max-w-[200px] sm:max-w-md ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {courseTitle} &bull;{" "}
              <span className={isDark ? "text-slate-200 font-medium" : "text-slate-800 font-semibold"}>
                {lectureTitle}
              </span>
            </p>
          </div>
        </div>

        {/* Center/Right: Live Knowledge Boundary, Controls, Auth & Progress */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Knowledge Boundary Pill */}
          <div
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border ${
              isDark
                ? "bg-slate-900/90 border-slate-800 text-slate-300"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Clock3 className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] opacity-80">Horizon:</span>
            <span
              className={`font-mono-timestamp font-semibold px-2 py-0.5 rounded-md border ${
                isDark
                  ? "bg-slate-950 text-blue-400 border-blue-900/60"
                  : "bg-white text-blue-700 border-blue-200"
              }`}
            >
              00:00 &rarr; {formatTimestamp(currentTimestamp)}
            </span>
            <Link
              href="/jev"
              className="flex items-center gap-1 text-[11px] text-emerald-500 hover:text-emerald-400 font-semibold pl-1 underline decoration-emerald-500/40"
              title="Open JEV (Judge & Evaluation Verification) Audit Center"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              0% Leakage (JEV)
            </Link>
          </div>

          {/* Playlist Drawer Button (Mobile/Tablet or Quick Access) */}
          {onTogglePlaylist && (
            <button
              onClick={onTogglePlaylist}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
              }`}
              title="Open playlist drawer"
            >
              <ListVideo className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">Lectures</span>
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {playlistCount}
              </span>
            </button>
          )}

          {/* Theater Mode Toggle */}
          {onToggleTheaterMode && (
            <button
              onClick={onToggleTheaterMode}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                isTheaterMode
                  ? "bg-blue-600 text-white border-blue-500"
                  : isDark
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title={isTheaterMode ? "Exit Theater Mode" : "Enter Wide Theater Mode"}
            >
              {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline">{isTheaterMode ? "Standard" : "Theater"}</span>
            </button>
          )}

          {/* Cinema Dark / Light Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title={isDark ? "Switch to Light Studio Theme" : "Switch to Cinema Dark Theme"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Watch Progress Indicator */}
          <div className="hidden sm:flex items-center gap-2 min-w-[76px] pl-1">
            <div className="text-right">
              <div className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Watched
              </div>
              <div className="text-xs font-bold">{progressPercent}%</div>
            </div>
            <div
              className={`w-10 h-2 rounded-full overflow-hidden border ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
              }`}
            >
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Auth User Pill or Sign In CTA */}
          {user ? (
            <div
              className={`flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-xl border text-xs ${
                isDark
                  ? "bg-slate-900/90 border-slate-800 text-slate-200"
                  : "bg-slate-100 border-slate-200 text-slate-800"
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline font-semibold max-w-[110px] truncate">{user.name}</span>
              <button
                onClick={handleSignOut}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDark ? "hover:bg-slate-800 text-slate-400 hover:text-rose-400" : "hover:bg-slate-200 text-slate-500 hover:text-rose-600"
                }`}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-colors shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
