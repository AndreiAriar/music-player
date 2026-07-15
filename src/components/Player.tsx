import { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward, Disc3 } from "lucide-react";
import type { Song } from "../types";

interface PlayerProps {
  current: Song | null;
  currentIndex: number | null;
  totalSongs: number;
  isPlaying: boolean;
  progress: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  togglePlayPause: () => void;
  next: () => void;
  prev: () => void;
}

export default function Player({
  current,
  currentIndex,
  totalSongs,
  isPlaying,
  progress,
  audioRef,
  togglePlayPause,
  next,
  prev,
}: PlayerProps) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    // duration may already be available if metadata loaded before this ran
    if (audio.readyState >= 1) setDuration(audio.duration || 0);
    return () => audio.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, [current, audioRef]);

  const fmt = (t: number) => {
    if (!t || Number.isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(time, duration || time));
    audioRef.current.currentTime = clamped;
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    seekTo(audioRef.current.currentTime + seconds);
  };

  return (
    <div className="sm:col-span-2 flex flex-col items-center bg-stone-900/60 border border-stone-800 rounded-2xl p-6">
      <div className="relative w-40 h-40 mb-6">
        {/* Vinyl disc — shape never changes, only the center label swaps */}
        <div
          className="w-40 h-40 rounded-full bg-gradient-to-br from-stone-800 to-stone-950 border-4 border-stone-700 flex items-center justify-center shadow-lg"
          style={{ animation: isPlaying ? "spin 3s linear infinite" : "none" }}
        >
          {current?.coverUrl ? (
            <img
              src={current.coverUrl}
              alt={`${current.name} cover`}
              className="w-20 h-20 rounded-full object-cover border-2 border-stone-950"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-600 border-2 border-stone-950" />
          )}
          {/* spindle hole */}
          <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-stone-950 border border-stone-600" />
        </div>
        <Disc3 className="absolute -top-2 -right-2 text-amber-600/40" size={28} />
      </div>

      <p className="font-serif text-lg text-center truncate w-full text-amber-50">
        {current ? current.name : "No track selected"}
      </p>
      <p className="text-xs font-mono text-amber-500/60 mb-4">
        {current ? `Track ${currentIndex! + 1} of ${totalSongs}` : "Upload a song to begin"}
      </p>

      {/* Time adjust: scrub bar first */}
      <div className="w-full mb-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(progress, duration || progress)}
          onChange={(e) => seekTo(Number(e.target.value))}
          disabled={!current}
          className="w-full h-1 accent-amber-600 disabled:opacity-30 cursor-pointer"
          aria-label="Seek"
        />
        <div className="flex items-center justify-between text-xs font-mono text-amber-500/50 mt-1">
          <span>{fmt(progress)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* 10s nudges sit next to previous/next */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => skip(-10)}
          disabled={!current}
          className="flex items-center gap-1 text-xs font-mono text-amber-200 hover:text-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Rewind 10 seconds"
        >
          <Rewind size={14} />
          10s
        </button>
        <button onClick={prev} className="text-amber-200 hover:text-amber-500 transition-colors" aria-label="Previous track">
          <SkipBack size={22} fill="currentColor" />
        </button>
        <button
          onClick={togglePlayPause}
          disabled={!current}
          className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:cursor-not-allowed flex items-center justify-center text-stone-950 transition-colors"
          aria-label="Play or pause"
        >
          {isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-0.5" />
          )}
        </button>
        <button onClick={next} className="text-amber-200 hover:text-amber-500 transition-colors" aria-label="Next track">
          <SkipForward size={22} fill="currentColor" />
        </button>
        <button
          onClick={() => skip(10)}
          disabled={!current}
          className="flex items-center gap-1 text-xs font-mono text-amber-200 hover:text-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Forward 10 seconds"
        >
          10s
          <FastForward size={14} />
        </button>
      </div>

      <audio
        ref={audioRef}
        src={current ? current.url : undefined}
        onEnded={next}
        className="hidden"
      />
    </div>
  );
}