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

interface VideoPlayerProps {
  currentTimestamp: number;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  videoSrc?: string;
  lectureTitle?: string;
}

export function VideoPlayer({
  currentTimestamp,
  onTimeUpdate,
  videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  lectureTitle = "Lecture 01: Attention Mechanisms & Transformers"
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync video time when seeking from outside (e.g., clicking on a transcript timestamp)
  useEffect(() => {
    if (videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - currentTimestamp) > 1.0) {
        videoRef.current.currentTime = currentTimestamp;
      }
    }
  }, [currentTimestamp]);

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
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      onTimeUpdate(targetTime, duration);
    }
  };

  const skipTime = (deltaSeconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + deltaSeconds, duration));
    videoRef.current.currentTime = newTime;
    onTimeUpdate(newTime, duration);
  };

  const handleRateChange = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuteState = !isMuted;
    videoRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setVolume(val);
      setIsMuted(val === 0);
    }
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

        {/* Play/Pause Center Overlay Button when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl backdrop-blur-xs cursor-pointer"
            aria-label="Play Video"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        )}

        {/* Controls Toolbar Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-col gap-2 transition-opacity">
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
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              {/* Rewind 10s */}
              <button
                onClick={() => skipTime(-10)}
                className="hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-0.5"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[10px]">10s</span>
              </button>

              {/* Fast Forward 10s */}
              <button
                onClick={() => skipTime(10)}
                className="hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-0.5"
                title="Forward 10 seconds"
              >
                <RotateCw className="w-4 h-4" />
                <span className="text-[10px]">10s</span>
              </button>

              {/* Timestamp Counter */}
              <div className="flex items-center gap-1 font-mono-timestamp text-slate-200 ml-2">
                <span className="font-semibold text-white">{formatTimestamp(currentTimestamp)}</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-400">{formatTimestamp(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Volume Slider */}
              <div className="flex items-center gap-1.5">
                <button onClick={toggleMute} className="hover:text-blue-400 cursor-pointer">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Playback Speed selector */}
              <div className="flex items-center gap-1 bg-slate-800/80 rounded-md px-1.5 py-0.5 border border-slate-700">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-1 py-0.5 text-[10px] rounded cursor-pointer ${
                      playbackRate === rate ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
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

      {/* RAG Knowledge Retrieval Boundary Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-800">Temporal Knowledge Boundary:</span>
            <span className="font-mono-timestamp bg-slate-100 text-slate-900 px-2 py-0.5 rounded font-bold border border-slate-200">
              00:00 &rarr; {formatTimestamp(currentTimestamp)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Enforced by Retrieval Filter</span>
        </div>

        {/* Visual Partition Timeline */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex border border-slate-200 relative">
          {/* Permitted Knowledge (Watched) */}
          <div
            className="h-full bg-emerald-500 transition-all duration-200 relative group flex items-center justify-end"
            style={{ width: `${Math.max(2, progressPercent)}%` }}
            title={`Permitted Evidence Window: 00:00 to ${formatTimestamp(currentTimestamp)}`}
          />
          {/* Future Content (Excluded) */}
          <div
            className="h-full bg-rose-100/70 flex-1 relative border-l-2 border-rose-500"
            title={`Future Content Protected: ${formatTimestamp(currentTimestamp)} to ${formatTimestamp(duration)}`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <div className="flex items-center gap-1 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Permitted RAG Retrieval: 00:00 &ndash; {formatTimestamp(currentTimestamp)}</span>
          </div>
          <div className="flex items-center gap-1 text-rose-600 font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Future Video Leakage: Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
