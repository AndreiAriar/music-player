import { useState, useRef, useEffect, type ChangeEvent } from "react";
import type { Song, LyricLine } from "./types";
import { parseLRC } from "./utils/lrc";
import {
  saveAudioFile,
  getAudioFile,
  deleteAudioFile,
  saveCoverFile,
  getCoverFile,
  deleteCoverFile,
} from "./utils/audioDb";
import { saveSongMeta, loadSongMeta, deleteSongMeta } from "./firebase/musicStore";
import { watchAuth } from "./firebase/auth";
import { isSigningUp } from "./firebase/authState";
import type { User } from "firebase/auth";
import Player from "./components/Player";
import Playlist from "./components/Playlist";
import LyricsPanel from "./components/LyricsPanel";
import Auth from "./components/Auth";
import VinylLogo from "./components/VinylLogo";
import Profile from "./components/Profile";
import SearchOnline from "./components/SearchOnline";
import type { ITunesTrack } from "./utils/itunes";

interface StoredSong extends Song {
  docId: string;
}

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [songs, setSongs] = useState<StoredSong[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [query, setQuery] = useState("");
  const [plainLyrics, setPlainLyrics] = useState("");
  const [syncedLyrics, setSyncedLyrics] = useState<LyricLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewTrack, setPreviewTrack] = useState<Song | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const libraryCurrent = currentIndex !== null ? songs[currentIndex] : null;
  // A streaming preview (search result) takes over playback without
  // being saved anywhere — it's just the <audio> element pointed at a
  // remote URL for as long as it's playing.
  const current = previewTrack ?? libraryCurrent;

  useEffect(
    () =>
      watchAuth((u) => {
        if (isSigningUp()) return;
        setUser(u);
      }),
    []
  );

  useEffect(() => {
    if (!user) return;
    (async () => {
      const metas = await loadSongMeta(user.uid);
      const loaded: StoredSong[] = [];
      for (const meta of metas) {
        const file = await getAudioFile(meta.id);
        if (file) {
          const coverFile = await getCoverFile(meta.id);
          loaded.push({
            id: meta.id,
            docId: meta.docId,
            name: meta.name,
            url: URL.createObjectURL(file),
            coverUrl: coverFile ? URL.createObjectURL(coverFile) : undefined,
          });
        }
      }
      setSongs(loaded);
    })();
  }, [user]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying, currentIndex, current]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setProgress(audio.currentTime);
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [current]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !user) return;

    const newSongs: StoredSong[] = [];
    for (const file of files) {
      const audioId = `${file.name}-${Date.now()}-${Math.random()}`;
      const name = file.name.replace(/\.[^/.]+$/, "");

      await saveAudioFile(audioId, file);
      const docId = await saveSongMeta(user.uid, audioId, name);

      newSongs.push({ id: audioId, docId, name, url: URL.createObjectURL(file) });
    }

    setSongs((prev) => [...prev, ...newSongs]);
    if (currentIndex === null) setCurrentIndex(0);
  };

  // Matches by song id (not array index) so it stays correct even if the
  // visible list is filtered or reordered by the time the cover finishes
  // uploading.
  // Downloads an iTunes preview clip (and its artwork, if any) and saves
  // through the same local IndexedDB + Firestore pipeline as a manual
  // upload — from here on, a web-added song behaves identically to
  // one you uploaded yourself.
  const addFromWeb = async (track: ITunesTrack) => {
    if (!user) return;

    const audioRes = await fetch(track.previewUrl);
    if (!audioRes.ok) throw new Error("Could not download track");
    const audioBlob = await audioRes.blob();
    const audioFile = new File([audioBlob], `${track.artist} - ${track.name}.m4a`, {
      type: "audio/mp4",
    });

    const audioId = `${audioFile.name}-${Date.now()}-${Math.random()}`;
    const name = audioFile.name.replace(/\.[^/.]+$/, "");

    await saveAudioFile(audioId, audioFile);
    const docId = await saveSongMeta(user.uid, audioId, name);

    let coverUrl: string | undefined;
    if (track.image) {
      try {
        const imgRes = await fetch(track.image);
        if (imgRes.ok) {
          const imgBlob = await imgRes.blob();
          const imgFile = new File([imgBlob], `${audioId}-cover.jpg`, {
            type: imgBlob.type || "image/jpeg",
          });
          await saveCoverFile(audioId, imgFile);
          coverUrl = URL.createObjectURL(imgFile);
        }
      } catch {
        // Cover art is a nice-to-have — don't fail the whole add over it.
      }
    }

    const newSong: StoredSong = {
      id: audioId,
      docId,
      name,
      url: URL.createObjectURL(audioFile),
      coverUrl,
    };
    setSongs((prev) => [...prev, newSong]);
    if (currentIndex === null) setCurrentIndex(0);
  };

  const addCover = async (songId: string, file: File) => {
    const song = songs.find((s) => s.id === songId);
    if (!song) return;

    await saveCoverFile(song.id, file);
    const coverUrl = URL.createObjectURL(file);
    setSongs((prev) => prev.map((s) => (s.id === songId ? { ...s, coverUrl } : s)));
  };

  const removeSong = async (index: number) => {
    const song = songs[index];
    if (!song) return;

    await deleteAudioFile(song.id);
    await deleteCoverFile(song.id);
    await deleteSongMeta(song.docId);

    setSongs((prev) => prev.filter((_, i) => i !== index));

    if (currentIndex === index) {
      setCurrentIndex(null);
      setIsPlaying(false);
      setPlainLyrics("");
      setSyncedLyrics([]);
    } else if (currentIndex !== null && index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const playAt = (index: number) => {
    setPreviewTrack(null);
    setCurrentIndex(index);
    setIsPlaying(true);
    setPlainLyrics("");
    setSyncedLyrics([]);
  };

  const togglePlayPause = () => {
    if (current) setIsPlaying((p) => !p);
  };

  // Starts (or pauses/resumes) streaming a search result without saving
  // it anywhere. Clicking the same track again just toggles play/pause;
  // clicking a different one switches the stream.
  const togglePreviewTrack = (track: ITunesTrack) => {
    if (previewTrack?.id === track.id) {
      togglePlayPause();
      return;
    }
    setPreviewTrack({
      id: track.id,
      name: `${track.artist} - ${track.name}`,
      url: track.previewUrl,
      coverUrl: track.image,
    });
    setIsPlaying(true);
    setPlainLyrics("");
    setSyncedLyrics([]);
  };

  const stopPreview = () => {
    setPreviewTrack(null);
    setIsPlaying(false);
  };

  const next = () => {
    if (songs.length === 0) return;
    const nextIndex = currentIndex === null ? 0 : (currentIndex + 1) % songs.length;
    playAt(nextIndex);
  };

  const prev = () => {
    if (songs.length === 0) return;
    const prevIndex = currentIndex === null ? 0 : (currentIndex - 1 + songs.length) % songs.length;
    playAt(prevIndex);
  };

  const onGenerateLyrics = async () => {
    if (!current) return;
    setLyricsLoading(true);
    setPlainLyrics("");
    setSyncedLyrics([]);

    const [artist, title] = current.name.includes(" - ")
      ? current.name.split(" - ").map((s) => s.trim())
      : [null, current.name.trim()];

    if (!artist) {
      setPlainLyrics(
        'Couldn\'t tell artist from title. Rename the file like "Artist - Title.mp3" and re-upload for a lyrics lookup.'
      );
      setLyricsLoading(false);
      return;
    }

    try {
      const lrclibRes = await fetch(
        `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`
      );
      if (lrclibRes.ok) {
        const results = await lrclibRes.json();
        const match = Array.isArray(results) ? results[0] : null;
        if (match?.syncedLyrics) {
          setSyncedLyrics(parseLRC(match.syncedLyrics));
          setLyricsLoading(false);
          return;
        }
        if (match?.plainLyrics) {
          setPlainLyrics(match.plainLyrics.trim());
          setLyricsLoading(false);
          return;
        }
      }

      const ovhRes = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      );
      if (!ovhRes.ok) throw new Error("not found");
      const data = await ovhRes.json();
      setPlainLyrics(data.lyrics ? data.lyrics.trim() : "No lyrics found for this track.");
    } catch {
      setPlainLyrics("Couldn't find lyrics for this track. Double check the artist and title spelling.");
    } finally {
      setLyricsLoading(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <VinylLogo size={48} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-start justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VinylLogo size={32} />
            <div>
              <p className="text-xs tracking-[0.3em] text-pink-400/80 font-mono uppercase">Life is better with</p>
              <h1 className="text-3xl font-serif tracking-tight bg-gradient-to-r from-sky-400 to-pink-500 bg-clip-text text-transparent">Music</h1>
            </div>
          </div>
          <Profile user={user} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-start">
          <Player
            current={current}
            currentIndex={currentIndex}
            totalSongs={songs.length}
            isPlaying={isPlaying}
            progress={progress}
            audioRef={audioRef}
            togglePlayPause={togglePlayPause}
            next={next}
            prev={prev}
            isPreview={!!previewTrack}
            onExitPreview={stopPreview}
          />

          <div className="sm:col-span-3 flex flex-col gap-4">
            <SearchOnline
              onAdd={addFromWeb}
              onPreviewToggle={togglePreviewTrack}
              previewId={previewTrack?.id ?? null}
              isPreviewPlaying={isPlaying}
            />
            <Playlist
              songs={songs}
              query={query}
              currentIndex={currentIndex}
              setQuery={setQuery}
              handleUpload={handleUpload}
              playAt={playAt}
              addCover={addCover}
              removeSong={removeSong}
            />
            <LyricsPanel
              plainLyrics={plainLyrics}
              syncedLyrics={syncedLyrics}
              progress={progress}
              isLoading={lyricsLoading}
              hasCurrentSong={!!current}
              onGenerateLyrics={onGenerateLyrics}
            />
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}