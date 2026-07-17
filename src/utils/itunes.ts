// Searches Apple's iTunes Search API — free, public, no signup or API
// key required. Returns official 30-second preview clips from Apple's
// real commercial catalog, which is why titles/artists are recognizable
// (unlike Jamendo's independent-only catalog). Previews are what Apple
// itself serves for "try before you buy" — full tracks aren't given out
// for free by any legitimate source.
//
// The actual request to itunes.apple.com happens server-side, via the
// /api/search Vercel function — not directly from the browser. Some
// networks/devices fail to reach itunes.apple.com directly (DNS
// filtering, firewalls, IP-based blocking) even though the same code
// works fine elsewhere; routing through our own domain avoids that
// entirely since the browser only ever talks to our own server.

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

const FETCH_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Even hitting our own domain, mobile networks can be flaky, so this
// still retries with a timeout rather than assuming one attempt is
// enough.
async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        break;
      }

      if (attempt < MAX_ATTEMPTS) {
        await sleep(attempt * 500);
      }
    }
  }

  throw lastError;
}

function describeFetchError(err: unknown): string {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You're offline — check your connection and try again.";
  }
  if (err instanceof DOMException && err.name === "AbortError") {
    return "Search timed out — your connection may be slow or unstable. Try again.";
  }
  return "Couldn't reach the search service right now. Please try again.";
}

export async function searchITunes(query: string): Promise<ITunesTrack[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `/api/search?term=${encodeURIComponent(trimmed)}`;

  let res: Response;
  try {
    res = await fetchWithRetry(url);
  } catch (err) {
    throw new Error(describeFetchError(err));
  }

  if (!res.ok) {
    let message = `Search failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore — fall back to the status-based message
    }
    throw new Error(message);
  }

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