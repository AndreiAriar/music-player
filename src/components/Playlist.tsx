import type { ChangeEvent } from "react";
import { Upload, Search, FileMusic, ImagePlus, Trash2 } from "lucide-react";
import type { Song } from "../types";

interface PlaylistProps {
  songs: Song[];
  query: string;
  currentIndex: number | null;
  isUploading?: boolean;
  setQuery: (q: string) => void;
  handleUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  playAt: (index: number) => void;
  addCover: (songId: string, file: File) => void;
  removeSong: (index: number) => void;
}

export default function Playlist({
  songs,
  query,
  currentIndex,
  isUploading = false,
  setQuery,
  handleUpload,
  playAt,
  addCover,
  removeSong,
}: PlaylistProps) {
  const filtered = songs
    .map((s, i) => ({ ...s, i }))
    .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400/70" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your uploads..."
            className="w-full bg-black/60 border border-sky-500/30 focus:border-pink-400 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
          />
        </div>
        <label
          className={`flex items-center gap-2 border border-pink-500/40 hover:border-pink-400 hover:bg-pink-500/10 transition-colors px-4 py-2 rounded-full cursor-pointer text-sm font-mono text-sky-300 whitespace-nowrap ${
            isUploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Upload size={15} />
          {isUploading ? "Saving..." : "Upload"}
          <input
            type="file"
            accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.flac"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="bg-black/60 border border-sky-500/20 rounded-2xl divide-y divide-sky-500/10 max-h-56 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-white/25">
            <FileMusic size={24} />
            <p className="text-xs font-mono">
              {songs.length === 0 ? "No tracks yet — upload to fill Side A" : "No matches"}
            </p>
          </div>
        )}
        {filtered.map((s) => (
          <div
            key={s.id}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
              currentIndex === s.i ? "bg-gradient-to-r from-sky-500/10 to-pink-500/10 text-pink-400" : "text-white"
            }`}
          >
            <button onClick={() => playAt(s.i)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
              {s.coverUrl ? (
                <img src={s.coverUrl} alt="" className="w-7 h-7 rounded object-cover flex-shrink-0" />
              ) : (
                <span className="font-mono text-xs text-sky-400/60 w-7 flex-shrink-0">
                  {String(s.i + 1).padStart(2, "0")}
                </span>
              )}
              <span className="font-serif truncate hover:text-sky-400 transition-colors">{s.name}</span>
            </button>

            <label
              className="text-pink-400/50 hover:text-pink-400 cursor-pointer flex-shrink-0 transition-colors"
              title="Add album cover"
            >
              <ImagePlus size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addCover(s.id, file);
                  e.target.value = "";
                }}
              />
            </label>

            <button
              onClick={() => removeSong(s.i)}
              className="text-sky-400/50 hover:text-red-400 flex-shrink-0 transition-colors"
              title="Remove track"
              aria-label={`Remove ${s.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}