import { useState } from "react";
import { Search, Loader2, Plus, Check, Play, Pause, X } from "lucide-react";
import { searchITunes, type ITunesTrack } from "../utils/itunes";

interface SearchOnlineProps {
  onAdd: (track: ITunesTrack) => Promise<void>;
  onPreviewToggle: (track: ITunesTrack) => void;
  previewId: string | null;
  isPreviewPlaying: boolean;
}

export default function SearchOnline({
  onAdd,
  onPreviewToggle,
  previewId,
  isPreviewPlaying,
}: SearchOnlineProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ITunesTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const tracks = await searchITunes(query);
      setResults(tracks);
      if (tracks.length === 0) setError("No results. Try a different search.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (track: ITunesTrack) => {
    setAddingId(track.id);
    try {
      await onAdd(track);
      setAddedIds((prev) => new Set(prev).add(track.id));
    } catch {
      setError("Couldn't add that track. Try again.");
    } finally {
      setAddingId(null);
    }
  };

  // Clears the query, results, and any error — collapsing the panel
  // back to its empty state without closing/unmounting the component.
  const closeSearch = () => {
    setQuery("");
    setResults([]);
    setError("");
    setAddingId(null);
  };

  const hasContent = query.length > 0 || results.length > 0 || !!error;

  return (
    <div className="bg-black/60 border border-sky-500/20 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-mono uppercase tracking-wider text-sky-400/70">
          Search songs <span className="text-pink-400/60">(iTunes previews, 30s clips)</span>
        </p>
        {hasContent && (
          <button
            onClick={closeSearch}
            className="flex-shrink-0 text-sky-400/50 hover:text-pink-400 transition-colors"
            aria-label="Close search"
            title="Close search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400/70" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search songs or artists..."
            // text-base (16px) rather than text-sm (14px) — iOS Safari
            // and Chrome auto-zoom the page when focusing an input
            // with a font-size under 16px. 16px+ suppresses that.
            className="w-full bg-black/60 border border-sky-500/30 focus:border-pink-400 rounded-full pl-9 pr-4 py-2 text-base sm:text-sm text-white placeholder:text-white/30 outline-none transition-colors"
          />
        </div>
        <button
          onClick={search}
          disabled={loading}
          className="px-4 py-2 rounded-full text-sm font-mono bg-gradient-to-br from-sky-400 to-pink-500 text-black hover:opacity-90 disabled:opacity-50 transition-opacity flex-shrink-0"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : "Search"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {results.length > 0 && (
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
          {results.map((track) => {
            const added = addedIds.has(track.id);
            return (
              <div
                key={track.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sky-500/5 transition-colors"
              >
                {track.image ? (
                  <img src={track.image} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded bg-zinc-900 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-serif text-white truncate">{track.name}</p>
                  <p className="text-xs font-mono text-sky-400/60 truncate">{track.artist}</p>
                </div>
                <button
                  onClick={() => onPreviewToggle(track)}
                  className="flex-shrink-0 text-sky-400/70 hover:text-sky-400 transition-colors"
                  aria-label={previewId === track.id && isPreviewPlaying ? `Pause ${track.name}` : `Play ${track.name}`}
                >
                  {previewId === track.id && isPreviewPlaying ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" />
                  )}
                </button>
                <button
                  onClick={() => handleAdd(track)}
                  disabled={added || addingId === track.id}
                  className="flex-shrink-0 text-pink-400/70 hover:text-pink-400 disabled:text-sky-400/40 transition-colors"
                  aria-label={`Add ${track.name}`}
                >
                  {addingId === track.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : added ? (
                    <Check size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] font-mono text-white/20">
        Official 30-second previews from Apple's catalog — great for finding and previewing real songs before adding your own full copy.
      </p>
    </div>
  );
}