export default function VinylLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="vinylLabelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#000000" stroke="#ec4899" strokeOpacity="0.4" strokeWidth="2" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="1" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="1" />
      <circle cx="50" cy="50" r="16" fill="url(#vinylLabelGradient)" />
      <circle cx="50" cy="50" r="3" fill="#000000" />
    </svg>
  );
}