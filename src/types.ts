export interface Song {
  id: string;
  name: string;
  url: string;
  coverUrl?: string;
}

export interface LyricLine {
  time: number; // seconds
  text: string;
}