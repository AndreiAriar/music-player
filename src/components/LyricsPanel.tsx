import { useEffect, useMemo, useRef } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { LyricLine } from "../types";

interface LyricsPanelProps {
  plainLyrics: string;
  syncedLyrics: LyricLine[];
  progress: number;
  isLoading: boolean;
  hasCurrentSong: boolean;
  onGenerateLyrics: () => void;
}

export default function LyricsPanel({
  plainLyrics,
  syncedLyrics,
  progress,
  isLoading,
  hasCurrentSong,
  onGenerateLyrics,
}: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSynced = syncedLyrics.length > 0;

  const activeIndex = useMemo(() => {
    if (!isSynced) return -1;
    let idx = -1;
    for (let i = 0; i < syncedLyrics.length; i++) {
      if (syncedLyrics[i].time <= progress) idx = i;
      else break;
    }
    return idx;
  }, [syncedLyrics, progress, isSynced]);

  useEffect(() => {
    if (!isSynced || activeIndex < 0 || !containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>(
      `[data-line-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex, isSynced]);

  return (
    <div className="bg-black/60 border border-sky-500/20 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-mono uppercase tracking-wider text-sky-400/70">
          Lyrics {isSynced && <span className="text-pink-400/60">(synced)</span>}
        </p>
        <button
          onClick={onGenerateLyrics}
          disabled={!hasCurrentSong || isLoading}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider border border-pink-500/40 hover:border-pink-400 hover:bg-pink-500/10 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-full text-sky-300 transition-colors"
        >
          {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {isLoading ? "Looking up..." : "Find lyrics"}
        </button>
      </div>

      <div ref={containerRef} className="max-h-64 overflow-y-auto pr-1">
        {isSynced ? (
          <div className="flex flex-col gap-2">
            {syncedLyrics.map((line, i) => (
              <p
                key={i}
                data-line-index={i}
                className={`font-serif text-sm leading-relaxed transition-colors ${
                  i === activeIndex ? "text-pink-400 font-medium" : "text-white/30"
                }`}
              >
                {line.text}
              </p>
            ))}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-serif text-sm text-white/80 leading-relaxed">
            {plainLyrics || "Select a track and hit \u201cFind lyrics\u201d to look them up."}
          </pre>
        )}
      </div>
    </div>
  );
}