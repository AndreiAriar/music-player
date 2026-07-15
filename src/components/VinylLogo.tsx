export default function VinylLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#1c1917" stroke="#78716c" strokeWidth="2" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#44403c" strokeWidth="1" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#44403c" strokeWidth="1" />
      <circle cx="50" cy="50" r="16" fill="#d97706" />
      <circle cx="50" cy="50" r="3" fill="#1c1917" />
    </svg>
  );
}