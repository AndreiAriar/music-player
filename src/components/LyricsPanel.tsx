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
    <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-mono uppercase tracking-wider text-amber-500/60">
          Lyrics {isSynced && <span className="text-amber-600/50">(synced)</span>}
        </p>
        <button
          onClick={onGenerateLyrics}
          disabled={!hasCurrentSong || isLoading}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider border border-amber-800/50 hover:border-amber-500 hover:bg-amber-500/10 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-full text-amber-200 transition-colors"
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
                  i === activeIndex ? "text-amber-400 font-medium" : "text-amber-100/40"
                }`}
              >
                {line.text}
              </p>
            ))}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-serif text-sm text-amber-100/80 leading-relaxed">
            {plainLyrics || "Select a track and hit \u201cFind lyrics\u201d to look them up."}
          </pre>
        )}
      </div>
    </div>
  );
}