import type { LyricLine } from "../types";

// Parses standard LRC format lines like "[01:02.34]Some lyric text"
// into { time, text } pairs sorted by time.
export function parseLRC(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const pattern = /\[(\d{2}):(\d{2})[.:](\d{2,3})\](.*)/g;

  for (const rawLine of lrc.split("\n")) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(rawLine)) !== null) {
      const [, mm, ss, ms, text] = match;
      const time =
        parseInt(mm, 10) * 60 +
        parseInt(ss, 10) +
        parseInt(ms.padEnd(3, "0"), 10) / 1000;
      const trimmed = text.trim();
      if (trimmed) lines.push({ time, text: trimmed });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}