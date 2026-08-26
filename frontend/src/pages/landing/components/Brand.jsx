export default function Brand({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0b2545" />
      <path d="M8 21.5C11 21.5 12 10.5 16 10.5C20 10.5 21 21.5 24 21.5" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="21.5" r="2.6" fill="#ffffff" />
      <circle cx="16" cy="10.5" r="2.6" fill="#a7f3d0" />
      <circle cx="24" cy="21.5" r="2.6" fill="#3b82f6" />
    </svg>
  );
}
