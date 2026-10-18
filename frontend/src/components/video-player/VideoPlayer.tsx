"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Clock,
  ShieldCheck,
  Film,
  Lock,
  Keyboard
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { TranscriptChunk } from "@/types";

function YouTubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface VideoPlayerProps {
  currentTimestamp: number;
  maxWatchedTimestamp?: number;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  videoSrc?: string;
  lectureTitle?: string;
  chapters?: TranscriptChunk[];
  pauseSignal?: number;
  isDark?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:v=|\/v\/|embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  const paramMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  return paramMatch ? paramMatch[1] : null;
}

export function VideoPlayer({
  currentTimestamp,
  maxWatchedTimestamp = 0,
  onTimeUpdate,
  videoSrc = "https://www.youtube.com/watch?v=ZftI2fEz0Fw",
  lectureTitle = "Day 01: What is Machine Learning? | 100 Days of Machine Learning",
  chapters = [],
  pauseSignal = 0,
  isDark = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytReadyRef = useRef<boolean>(false);
  const ytIntervalRef = useRef<any>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  const callYT = (method: string, ...args: any[]): any => {
    const p = ytPlayerRef.current;
    if (!ytReadyRef.current || !p || typeof p[method] !== "function") return undefined;
    try {
      return p[method](...args);
    } catch {
      return undefined;
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showNativeControls, setShowNativeControls] = useState(false);
  const [hoveredChapter, setHoveredChapter] = useState<TranscriptChunk | null>(null);
  const [showShortcutsHint, setShowShortcutsHint] = useState(false);

  const ytVideoId = extractYouTubeId(videoSrc);

  // 1. YouTube IFrame API Initialization
  useEffect(() => {
    if (!ytVideoId) return;

    let cancelled = false;
    ytReadyRef.current = false;
    setIsPlaying(false);

    const stopPolling = () => {
      if (ytIntervalRef.current) {
        clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
    };

    const setupPlayer = () => {
      if (cancelled || !ytHostRef.current || !window.YT?.Player) return;

      ytHostRef.current.innerHTML = "";
      const mountNode = document.createElement("div");
      ytHostRef.current.appendChild(mountNode);

      ytPlayerRef.current = new window.YT.Player(mountNode, {
        videoId: ytVideoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          controls: showNativeControls ? 1 : 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          fs: 0,
          disablekb: showNativeControls ? 0 : 1
        },
        events: {
          onReady: (event: any) => {
            if (cancelled) return;
            ytReadyRef.current = true;
            const dur = event.target.getDuration?.() || 0;
            if (dur > 0) {
              setDuration(dur);
              onTimeUpdateRef.current(event.target.getCurrentTime?.() || 0, dur);
            }
          },
          onStateChange: (event: any) => {
            if (cancelled) return;
            const PLAYING = window.YT?.PlayerState?.PLAYING ?? 1;
            if (event.data === PLAYING) {
              setIsPlaying(true);
              stopPolling();
              ytIntervalRef.current = setInterval(() => {
                const cur = callYT("getCurrentTime") || 0;
                const dur = callYT("getDuration") || 0;
                if (dur > 0) setDuration(dur);
                onTimeUpdateRef.current(cur, dur);
              }, 250);
            } else {
              setIsPlaying(false);
              stopPolling();
              const cur = callYT("getCurrentTime");
              if (typeof cur === "number") {
                onTimeUpdateRef.current(cur, callYT("getDuration") || 0);
              }
            }
          }
        }
      });
    };

    if (window.YT?.Player) {
      setupPlayer();
    } else {
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        setupPlayer();
      };
    }

    return () => {
      cancelled = true;
      stopPolling();
      ytReadyRef.current = false;
      try {
        ytPlayerRef.current?.destroy?.();
      } catch {}
      ytPlayerRef.current = null;
      if (ytHostRef.current) ytHostRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytVideoId, showNativeControls]);

  // 2. Sync playback time when seeking from outside (e.g. clicking a citation)
  useEffect(() => {
    if (ytVideoId) {
      const cur = callYT("getCurrentTime");
      if (typeof cur === "number" && Math.abs(cur - currentTimestamp) > 1.2) {
        callYT("seekTo", currentTimestamp, true);
      }
    } else if (videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - currentTimestamp) > 1.0) {
        videoRef.current.currentTime = currentTimestamp;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTimestamp, ytVideoId]);

  // 3. External pause signal (e.g. "Pause on Ask" when typing in AI Assistant)
  useEffect(() => {
    if (!pauseSignal) return;
    if (ytVideoId) {
      const PLAYING = window.YT?.PlayerState?.PLAYING ?? 1;
      if (callYT("getPlayerState") === PLAYING) {
        callYT("pauseVideo");
      }
    } else if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pauseSignal]);

  // 4. Global Keyboard Shortcuts (Space, J, L, M, F) when not focused inside an input/textarea
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.code === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "j" || e.key === "J" || e.key === "ArrowLeft") {
        e.preventDefault();
        skipTime(-10);
      } else if (e.key === "l" || e.key === "L" || e.key === "ArrowRight") {
        e.preventDefault();
        skipTime(10);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      onTimeUpdate(videoRef.current.currentTime, dur);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || duration;
      onTimeUpdate(cur, dur);
    }
  };

  const togglePlay = () => {
    if (ytVideoId) {
      if (!ytReadyRef.current) return;
      const PLAYING = window.YT?.PlayerState?.PLAYING ?? 1;
      if (callYT("getPlayerState") === PLAYING) {
        callYT("pauseVideo");
      } else {
        callYT("playVideo");
      }
      return;
    }

    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (ytVideoId) {
      callYT("seekTo", targetTime, true);
      onTimeUpdate(targetTime, duration);
      return;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      onTimeUpdate(targetTime, duration);
    }
  };

  const skipTime = (deltaSeconds: number) => {
    if (ytVideoId) {
      const cur = callYT("getCurrentTime");
      if (typeof cur !== "number") return;
      const newTime = Math.max(0, Math.min(cur + deltaSeconds, duration || 10000));
      callYT("seekTo", newTime, true);
      onTimeUpdate(newTime, duration);
      return;
    }
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + deltaSeconds, duration));
    videoRef.current.currentTime = newTime;
    onTimeUpdate(newTime, duration);
  };

  const handleRateChange = (rate: number) => {
    if (ytVideoId) {
      callYT("setPlaybackRate", rate);
      setPlaybackRate(rate);
      return;
    }
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleMute = () => {
    if (ytVideoId) {
      if (!ytReadyRef.current) return;
      if (isMuted) {
        callYT("unMute");
        setIsMuted(false);
      } else {
        callYT("mute");
        setIsMuted(true);
      }
      return;
    }
    if (!videoRef.current) return;
    const newMuteState = !isMuted;
    videoRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const effectiveDuration = duration || 1200;
  const progressPercent = effectiveDuration > 0 ? Math.min(100, (currentTimestamp / effectiveDuration) * 100) : 0;
  const maxWatchedPercent =
    effectiveDuration > 0
      ? Math.min(100, (Math.max(currentTimestamp, maxWatchedTimestamp) / effectiveDuration) * 100)
      : 0;

  // Determine current active chapter
  const activeChapter = chapters.find(
    (c) => currentTimestamp >= c.startTime && currentTimestamp <= c.endTime
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Video Theatre Container */}
      <div
        ref={containerRef}
        className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800/90 group"
      >
        {ytVideoId ? (
          <div className="w-full aspect-video bg-black relative flex items-center justify-center overflow-hidden">
            <div ref={ytHostRef} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
            {!showNativeControls && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 cursor-pointer z-10"
                title={isPlaying ? "Click to Pause (Space)" : "Click to Play (Space)"}
              />
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full aspect-video object-contain bg-black"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            playsInline
          />
        )}

        {/* Play/Pause Center Overlay Button when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-2xl shadow-blue-500/40 backdrop-blur-xs cursor-pointer z-20 pointer-events-auto"
            aria-label="Play Video"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        )}

        {/* Floating Chapter Hover Tooltip */}
        {hoveredChapter && (
          <div className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-auto sm:max-w-sm bg-slate-900/95 text-white border border-slate-700/80 rounded-xl px-3 py-2 text-xs shadow-xl backdrop-blur-md z-30 pointer-events-none">
            <div className="flex items-center gap-1.5 text-blue-400 font-mono-timestamp font-bold text-[11px] mb-0.5">
              <Clock className="w-3 h-3" />
              <span>
                {formatTimestamp(hoveredChapter.startTime)} &ndash; {formatTimestamp(hoveredChapter.endTime)}
              </span>
            </div>
            <p className="line-clamp-2 text-slate-200 leading-snug">{hoveredChapter.text}</p>
          </div>
        )}

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="bg-slate-900/95 border-t border-slate-800 px-3.5 py-3 flex flex-col gap-2.5">
          {/* Progress / Scrubber Bar with Chapter Tick Markers */}
          <div className="relative w-full flex items-center group/scrubber cursor-pointer py-1">
            {/* Chapter Boundary Ticks */}
            {chapters.length > 1 &&
              chapters.slice(1).map((ch) => {
                const leftPct = Math.min(99.5, Math.max(0.5, (ch.startTime / effectiveDuration) * 100));
                return (
                  <div
                    key={ch.id}
                    onMouseEnter={() => setHoveredChapter(ch)}
                    onMouseLeave={() => setHoveredChapter(null)}
                    onClick={() => {
                      if (ytVideoId) callYT("seekTo", ch.startTime, true);
                      onTimeUpdate(ch.startTime, effectiveDuration);
                    }}
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white/40 hover:bg-amber-400 hover:scale-150 rounded-full z-10 transition-transform cursor-pointer"
                    style={{ left: `${leftPct}%` }}
                    title={`${formatTimestamp(ch.startTime)}: ${ch.text.slice(0, 60)}...`}
                  />
                );
              })}

            <input
              type="range"
              min={0}
              max={effectiveDuration}
              step={0.1}
              value={currentTimestamp}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700/70 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-hidden relative z-0"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progressPercent}%, rgba(59,130,246,0.28) ${progressPercent}%, rgba(59,130,246,0.28) ${maxWatchedPercent}%, rgba(255,255,255,0.15) ${maxWatchedPercent}%)`
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              {/* Skip -10s */}
              <button
                onClick={() => skipTime(-10)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title="Rewind 10s (J / Left Arrow)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Skip +10s */}
              <button
                onClick={() => skipTime(10)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title="Forward 10s (L / Right Arrow)"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume / Mute */}
              <button
                onClick={toggleMute}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Timestamp Counter */}
              <div className="font-mono-timestamp text-slate-300 font-medium text-xs ml-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{formatTimestamp(currentTimestamp)}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{formatTimestamp(effectiveDuration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Keyboard Shortcuts Pill */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setShowShortcutsHint(!showShortcutsHint)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                  title="Keyboard shortcuts"
                >
                  <Keyboard className="w-3 h-3" />
                  <span>Shortcuts</span>
                </button>
                {showShortcutsHint && (
                  <div className="absolute bottom-8 right-0 w-52 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-[11px] text-slate-300 shadow-2xl z-30 space-y-1">
                    <div className="font-semibold text-white pb-1 border-b border-slate-800">Player Shortcuts</div>
                    <div className="flex justify-between"><span>Play / Pause</span><kbd className="bg-slate-800 px-1.5 rounded text-blue-300">Space</kbd></div>
                    <div className="flex justify-between"><span>Rewind 10s</span><kbd className="bg-slate-800 px-1.5 rounded text-blue-300">J / &larr;</kbd></div>
                    <div className="flex justify-between"><span>Forward 10s</span><kbd className="bg-slate-800 px-1.5 rounded text-blue-300">L / &rarr;</kbd></div>
                    <div className="flex justify-between"><span>Mute</span><kbd className="bg-slate-800 px-1.5 rounded text-blue-300">M</kbd></div>
                    <div className="flex justify-between"><span>Fullscreen</span><kbd className="bg-slate-800 px-1.5 rounded text-blue-300">F</kbd></div>
                  </div>
                )}
              </div>

              {/* YouTube indicator & Native Bar Toggle */}
              {ytVideoId && (
                <div className="flex items-center gap-1.5">
                  <div className="hidden md:flex items-center gap-1 text-[11px] font-medium text-red-400 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded-full">
                    <YouTubeIcon className="w-3 h-3" />
                    <span>YT</span>
                  </div>

                  <button
                    onClick={() => setShowNativeControls(!showNativeControls)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                      showNativeControls
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                    title="Toggle native YouTube player controls"
                  >
                    {showNativeControls ? "YT Bar: On" : "YT Bar: Off"}
                  </button>
                </div>
              )}

              {/* Speed Selector */}
              <div className="flex items-center gap-0.5 bg-slate-800/80 rounded-md px-1 py-0.5 border border-slate-700">
                {[1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      playbackRate === rate ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title="Toggle Fullscreen (F)"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Temporal Knowledge Horizon & Chapter Verification Card */}
      <div
        className={`rounded-2xl p-3.5 border transition-colors ${
          isDark
            ? "bg-slate-900/90 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900 shadow-xs"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2.5">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Temporal Knowledge Horizon:</span>
            <span
              className={`font-mono-timestamp font-semibold px-2 py-0.5 rounded-md border ${
                isDark
                  ? "bg-blue-950/60 text-blue-300 border-blue-800/60"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              00:00 &rarr; {formatTimestamp(currentTimestamp)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div
              className={`flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full border text-[11px] ${
                isDark
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>0% Future Leakage Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Segmented Chapter & Horizon Bar */}
        <div
          className={`relative w-full h-3.5 rounded-full overflow-hidden border flex ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}
        >
          {/* Accessible Knowledge (00:00 -> currentTimestamp) */}
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 transition-all duration-200 flex items-center justify-end pr-1.5"
            style={{ width: `${progressPercent}%` }}
          >
            {progressPercent > 10 && (
              <span className="text-[9px] text-white font-bold tracking-wider uppercase font-mono-timestamp">
                Unlocked
              </span>
            )}
          </div>

          {/* Locked Future Scope (currentTimestamp -> end) */}
          <div
            className={`h-full transition-all duration-200 relative overflow-hidden ${
              isDark ? "bg-slate-900" : "bg-slate-200"
            }`}
            style={{ width: `${100 - progressPercent}%` }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #64748b, #64748b 6px, transparent 6px, transparent 12px)"
              }}
            />
            {100 - progressPercent > 20 && (
              <span
                className={`absolute inset-0 flex items-center pl-2.5 gap-1 text-[9px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Future Lecture Content Shielded</span>
              </span>
            )}
          </div>
        </div>

        {/* Active Chapter & Lecture Footer */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-2.5 text-[11px] ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          <span className="flex items-center gap-1.5 truncate">
            <Film className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">
              {activeChapter ? (
                <>
                  <strong className={isDark ? "text-slate-200" : "text-slate-700"}>
                    Active Segment ({formatTimestamp(activeChapter.startTime)}&ndash;{formatTimestamp(activeChapter.endTime)}):
                  </strong>{" "}
                  {activeChapter.text}
                </>
              ) : (
                <strong className={isDark ? "text-slate-200" : "text-slate-700"}>{lectureTitle}</strong>
              )}
            </span>
          </span>
          <span className="font-mono-timestamp shrink-0">
            {formatTimestamp(currentTimestamp)} / {formatTimestamp(effectiveDuration)}
          </span>
        </div>
      </div>
    </div>
  );
}
