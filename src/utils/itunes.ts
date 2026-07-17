// Searches Apple's iTunes Search API — free, public, no signup or API
// key required. Returns official 30-second preview clips from Apple's
// real commercial catalog, which is why titles/artists are recognizable
// (unlike Jamendo's independent-only catalog). Previews are what Apple
// itself serves for "try before you buy" — full tracks aren't given out
// for free by any legitimate source.

export interface ITunesTrack {
  id: string;
  name: string;
  artist: string;
  image: string;
  previewUrl: string;
}

interface ITunesApiResult {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  previewUrl?: string;
}

export async function searchITunes(query: string): Promise<ITunesTrack[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    trimmed
  )}&media=music&limit=12`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  const results: ITunesApiResult[] = data.results ?? [];

  return results
    .filter((r) => r.previewUrl)
    .map((r) => ({
      id: String(r.trackId),
      name: r.trackName,
      artist: r.artistName,
      // Apple's default artwork is a small 100x100 thumbnail; swapping
      // the size in the URL gets a sharper 300x300 image for free.
      image: r.artworkUrl100 ? r.artworkUrl100.replace("100x100", "300x300") : "",
      previewUrl: r.previewUrl as string,
    }));
}