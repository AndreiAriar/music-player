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

const FETCH_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mobile browsers (especially Safari) throw a bare "Load failed" /
// "TypeError: Failed to fetch" for a bunch of different underlying
// causes — a flaky cellular connection, a content blocker treating
// itunes.apple.com as a tracker, iCloud Private Relay, or a genuine
// timeout. A single unretried fetch with no timeout is fragile on
// mobile networks in a way it just isn't on wifi/desktop, so this
// wraps the request with a timeout + a couple of retries, and turns
// the generic error into something the UI can actually explain.
async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        // Explicit, even though it's the default for a cross-origin
        // GET like this — some in-app / embedded webviews on mobile
        // behave inconsistently without it being spelled out.
        mode: "cors",
      });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      // Don't retry if the device is straight up offline — retrying
      // instantly won't help and just delays the error message.
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        break;
      }

      if (attempt < MAX_ATTEMPTS) {
        await sleep(attempt * 500); // 500ms, then 1000ms backoff
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
  if (err instanceof TypeError) {
    // This is the bucket Safari's "Load failed" falls into. It's
    // usually a content blocker / tracking-prevention setting
    // interfering with the request rather than a real outage.
    return "Couldn't reach the search service. If you're on Safari or use a content blocker, try disabling 'Prevent Cross-Site Tracking' or any ad/tracker blocker for this site, then retry.";
  }
  return "Search failed. Please try again.";
}

export async function searchITunes(query: string): Promise<ITunesTrack[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    trimmed
  )}&media=music&limit=12`;

  let res: Response;
  try {
    res = await fetchWithRetry(url);
  } catch (err) {
    throw new Error(describeFetchError(err));
  }

  if (!res.ok) throw new Error(`Search failed (${res.status})`);

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