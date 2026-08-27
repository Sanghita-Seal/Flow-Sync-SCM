// Minimal inline SVG icon set — no external icon library dependency.
// Each icon accepts width/height/className like a normal component.

export function User(props) {
  const { width = 20, height = 20, className = "", ...rest } = props;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function base(props, path) {
  const { width = 20, height = 20, className = "", ...rest } = props;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {path}
    </svg>
  );
}

export const Truck = (p) => base(p, <>
  <rect x="1" y="7" width="14" height="10" rx="1" />
  <path d="M15 10h4l3 3v4h-7z" />
  <circle cx="6" cy="19" r="1.6" />
  <circle cx="17.5" cy="19" r="1.6" />
</>);

export const Package = (p) => base(p, <>
  <path d="M21 8l-9-5-9 5 9 5 9-5z" />
  <path d="M3 8v9l9 5 9-5V8" />
  <path d="M12 13v9" />
</>);

export const Dock = (p) => base(p, <>
  <rect x="3" y="4" width="7" height="16" rx="1" />
  <rect x="14" y="4" width="7" height="16" rx="1" />
  <path d="M10 12h4" />
</>);

export const Yard = (p) => base(p, <>
  <path d="M3 21h18" />
  <path d="M5 21V10l7-6 7 6v11" />
  <path d="M9 21v-6h6v6" />
</>);

export const Alert = (p) => base(p, <>
  <path d="M12 9v4" />
  <path d="M12 17h.01" />
  <path d="M10.3 3.9L1.8 18a1.6 1.6 0 0 0 1.4 2.4h17.6a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0z" />
</>);

export const Demand = (p) => base(p, <>
  <path d="M3 3v18h18" />
  <path d="M7 14l4-4 3 3 5-6" />
</>);

export const Inventory = (p) => base(p, <>
  <rect x="3" y="7" width="18" height="13" rx="1" />
  <path d="M3 7l2-4h14l2 4" />
  <path d="M9 11h6" />
</>);

export const Procurement = (p) => base(p, <>
  <circle cx="9" cy="20" r="1.5" />
  <circle cx="17" cy="20" r="1.5" />
  <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
</>);

export const Production = (p) => base(p, <>
  <path d="M3 20V10l5 3V10l5 3V10l5 3v7z" />
  <path d="M3 20h18" />
</>);

export const SOP = (p) => base(p, <>
  <circle cx="12" cy="12" r="9" />
  <path d="M12 7v5l3 3" />
</>);

export const Markdown = (p) => base(p, <>
  <path d="M4 4h16v16H4z" />
  <path d="M8 15V9l3 3 3-3v6" />
  <path d="M17 9v6" />
</>);

export const Bell = (p) => base(p, <>
  <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
  <path d="M10 20a2 2 0 0 0 4 0" />
</>);

export const Menu = (p) => base(p, <>
  <line x1="4" x2="20" y1="12" y2="12" />
  <line x1="4" x2="20" y1="6" y2="6" />
  <line x1="4" x2="20" y1="18" y2="18" />
</>);

export const X = (p) => base(p, <>
  <path d="M18 6 6 18" />
  <path d="m6 6 12 12" />
</>);
