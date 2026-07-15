import type { ChangeEvent } from "react";
import { Upload, Search, FileMusic, ImagePlus } from "lucide-react";
import type { Song } from "../types";

interface PlaylistProps {
  songs: Song[];
  query: string;
  currentIndex: number | null;
  isUploading: boolean;
  setQuery: (q: string) => void;
  handleUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  playAt: (index: number) => void;
  addCover: (songId: string, file: File) => void;
}

export default function Playlist({
  songs,
  query,
  currentIndex,
  isUploading,
  setQuery,
  handleUpload,
  playAt,
  addCover,
}: PlaylistProps) {
  const filtered = songs
    .map((s, i) => ({ ...s, i }))
    .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/60" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your uploads..."
            className="w-full bg-stone-900/60 border border-stone-800 focus:border-amber-500 rounded-full pl-9 pr-4 py-2 text-sm text-amber-50 placeholder:text-amber-100/30 outline-none transition-colors"
          />
        </div>
        <label
          className={`flex items-center gap-2 border border-amber-800/50 hover:border-amber-500 hover:bg-amber-500/10 transition-colors px-4 py-2 rounded-full cursor-pointer text-sm font-mono text-amber-200 whitespace-nowrap ${
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

      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl divide-y divide-stone-800 max-h-56 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-amber-100/30">
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
              currentIndex === s.i ? "bg-amber-500/10 text-amber-400" : "text-amber-50"
            }`}
          >
            <button onClick={() => playAt(s.i)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
              {s.coverUrl ? (
                <img src={s.coverUrl} alt="" className="w-7 h-7 rounded object-cover flex-shrink-0" />
              ) : (
                <span className="font-mono text-xs text-amber-500/50 w-7 flex-shrink-0">
                  {String(s.i + 1).padStart(2, "0")}
                </span>
              )}
              <span className="font-serif truncate hover:text-amber-400 transition-colors">{s.name}</span>
            </button>

            <label
              className="text-amber-500/40 hover:text-amber-400 cursor-pointer flex-shrink-0 transition-colors"
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
          </div>
        ))}
      </div>
    </div>
  );
}