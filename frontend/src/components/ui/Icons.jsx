// Minimal inline SVG icon set — kept dependency-free so the project
// doesn't need an icon library installed. Swap for lucide-react (or
// whatever you already use) if one is available in the project.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const Truck = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" /></svg>);
export const Package = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>);
export const Dock = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><rect x="3" y="4" width="18" height="14" rx="1" /><path d="M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01" /></svg>);
export const Yard = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><path d="M12 3l9 6-9 6-9-6 9-6z" /><path d="M3 15l9 6 9-6" /></svg>);
export const Alert = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4" /><path d="M12 17h.01" /></svg>);
export const Demand = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>);
export const Inventory = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>);
export const Procurement = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /><path d="M2 3h3l2.4 12.2a2 2 0 002 1.8h8.2a2 2 0 002-1.6L21 8H6" /></svg>);
export const Production = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><path d="M3 21V9l6 4V9l6 4V7l6 4v10z" /></svg>);
export const SOP = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>);
export const Markdown = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><path d="M20 12l-8 8-9-9V4h7l10 8z" /><circle cx="7.5" cy="7.5" r="1.2" /></svg>);
export const Bell = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><path d="M18 8a6 6 0 00-12 0c0 6-2 8-2 8h16s-2-2-2-8" /><path d="M10.3 21a1.9 1.9 0 003.4 0" /></svg>);
export const User = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21a7.5 7.5 0 0115 0" /></svg>);
export const Grid = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>);
export const ChevronRight = (p) => (<svg {...base} width={p.width || 20} height={p.height || 20} {...p}><path d="M9 6l6 6-6 6" /></svg>);
