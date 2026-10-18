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
  ShieldAlert,
  ShieldCheck,
  Film
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

function YouTubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface VideoPlayerProps {
  currentTimestamp: number;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  videoSrc?: string;
  lectureTitle?: string;
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
  onTimeUpdate,
  videoSrc = "https://www.youtube.com/watch?v=ZftI2fEz0Fw",
  lectureTitle = "Day 01: What is Machine Learning? | 100 Days of Machine Learning"
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytIntervalRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNativeControls, setShowNativeControls] = useState(false);

  const ytVideoId = extractYouTubeId(videoSrc);

  // 1. YouTube IFrame API Initialization
  useEffect(() => {
    if (!ytVideoId) {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const setupPlayer = () => {
      if (!isMounted || !window.YT || !window.YT.Player) return;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new window.YT.Player("youtube-player-element", {
        videoId: ytVideoId,
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
            if (!isMounted) return;
            const dur = event.target.getDuration() || 0;
            if (dur > 0) {
              setDuration(dur);
              onTimeUpdate(event.target.getCurrentTime() || 0, dur);
            }
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            // 1: PLAYING, 2: PAUSED, 0: ENDED
            if (event.data === 1) {
              setIsPlaying(true);
              if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
              ytIntervalRef.current = setInterval(() => {
                if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
                  const cur = ytPlayerRef.current.getCurrentTime() || 0;
                  const dur = ytPlayerRef.current.getDuration() || duration;
                  if (dur > 0) setDuration(dur);
                  onTimeUpdate(cur, dur);
                }
              }, 250);
            } else {
              setIsPlaying(false);
              if (ytIntervalRef.current) {
                clearInterval(ytIntervalRef.current);
                ytIntervalRef.current = null;
              }
              if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
                const cur = ytPlayerRef.current.getCurrentTime() || 0;
                const dur = ytPlayerRef.current.getDuration() || duration;
                onTimeUpdate(cur, dur);
              }
            }
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        setupPlayer();
      };
    } else {
      setupPlayer();
    }

    return () => {
      isMounted = false;
      if (ytIntervalRef.current) {
        clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
    };
  }, [ytVideoId, showNativeControls]);

  // 2. Sync playback time when seeking from outside (e.g. clicking a citation)
  useEffect(() => {
    if (ytVideoId && ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
      const cur = ytPlayerRef.current.getCurrentTime();
      if (Math.abs(cur - currentTimestamp) > 1.2) {
        ytPlayerRef.current.seekTo(currentTimestamp, true);
      }
    } else if (videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - currentTimestamp) > 1.0) {
        videoRef.current.currentTime = currentTimestamp;
      }
    }
  }, [currentTimestamp, ytVideoId]);

  // HTML5 Video handlers
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
    if (ytVideoId && ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
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
    if (ytVideoId && ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(targetTime, true);
      onTimeUpdate(targetTime, duration);
      return;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      onTimeUpdate(targetTime, duration);
    }
  };

  const skipTime = (deltaSeconds: number) => {
    if (ytVideoId && ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
      const cur = ytPlayerRef.current.getCurrentTime() || 0;
      const newTime = Math.max(0, Math.min(cur + deltaSeconds, duration || 10000));
      ytPlayerRef.current.seekTo(newTime, true);
      onTimeUpdate(newTime, duration);
      return;
    }
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + deltaSeconds, duration));
    videoRef.current.currentTime = newTime;
    onTimeUpdate(newTime, duration);
  };

  const handleRateChange = (rate: number) => {
    if (ytVideoId && ytPlayerRef.current && ytPlayerRef.current.setPlaybackRate) {
      ytPlayerRef.current.setPlaybackRate(rate);
      setPlaybackRate(rate);
      return;
    }
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleMute = () => {
    if (ytVideoId && ytPlayerRef.current) {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        setIsMuted(false);
      } else {
        ytPlayerRef.current.mute();
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
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const progressPercent = duration > 0 ? (currentTimestamp / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800 group"
      >
        {ytVideoId ? (
          <div className="w-full aspect-video bg-black relative flex items-center justify-center overflow-hidden">
            <div
              id="youtube-player-element"
              key={`${ytVideoId}-${showNativeControls ? "ctrl" : "noctrl"}`}
              className="w-full h-full pointer-events-auto"
            />
            {/* Click to play/pause transparent overlay when native controls are hidden */}
            {!showNativeControls && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 cursor-pointer z-10"
                title={isPlaying ? "Click to Pause" : "Click to Play"}
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
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl backdrop-blur-xs cursor-pointer z-20 pointer-events-auto"
            aria-label="Play Video"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        )}

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="bg-slate-900 border-t border-slate-800 p-3 flex flex-col gap-2">
          {/* Progress / Scrubber Bar */}
          <div className="relative w-full flex items-center group/scrubber cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTimestamp}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700/60 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-hidden"
              style={{
                background: `linear-gradient(to right, #2563EB ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white text-xs pt-1">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              {/* Skip -10s */}
              <button
                onClick={() => skipTime(-10)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Skip +10s */}
              <button
                onClick={() => skipTime(10)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume / Mute */}
              <button
                onClick={toggleMute}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Timestamp Counter */}
              <div className="font-mono-timestamp text-slate-300 font-medium text-xs ml-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{formatTimestamp(currentTimestamp)}</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400">{formatTimestamp(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* YouTube indicator & Controls Toggle */}
              {ytVideoId && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-red-400 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded-full">
                    <YouTubeIcon className="w-3.5 h-3.5" />
                    <span>YouTube Stream</span>
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
                    {showNativeControls ? "Native Bar: On" : "Native Bar: Hidden"}
                  </button>
                </div>
              )}

              {/* Speed Selector */}
              <div className="flex items-center gap-1 bg-slate-800/80 rounded-md px-1.5 py-0.5 border border-slate-700">
                {[1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
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
                title="Toggle Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Temporal Knowledge Horizon & Verification Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Temporal Knowledge Horizon:</span>
            <span className="font-mono-timestamp font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              00:00 &rarr; {formatTimestamp(currentTimestamp)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>0% Future Leakage Invariant</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Boundary Bar */}
        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex">
          {/* Accessible Knowledge (Past -> Current) */}
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200 flex items-center justify-end pr-1"
            style={{ width: `${progressPercent}%` }}
          >
            {progressPercent > 8 && (
              <span className="text-[9px] text-white font-bold tracking-wider uppercase font-mono-timestamp">
                Accessible
              </span>
            )}
          </div>

          {/* Locked Knowledge (Current -> Future) */}
          <div
            className="h-full bg-slate-200 transition-all duration-200 relative overflow-hidden"
            style={{ width: `${100 - progressPercent}%` }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #000, #000 6px, transparent 6px, transparent 12px)"
              }}
            />
            {100 - progressPercent > 18 && (
              <span className="absolute inset-0 flex items-center pl-2 text-[9px] text-slate-500 font-medium">
                Locked Future Scope
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Film className="w-3.5 h-3.5 text-slate-400" />
            <span>Lecture: <strong>{lectureTitle}</strong></span>
          </span>
          <span className="text-slate-400">
            {formatTimestamp(currentTimestamp)} watched of {formatTimestamp(duration)} total
          </span>
        </div>
      </div>
    </div>
  );
}
