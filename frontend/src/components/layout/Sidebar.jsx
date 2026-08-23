import { NavLink } from "react-router-dom";
import { Grid, ChevronRight } from "../ui/Icons";

const NAV_GROUPS = [
  {
    title: "E2 – Warehouse Management",
    items: [
      { label: "Trucks", path: "/e2/trucks" },
      { label: "Yard", path: "/e2/yard" },
      { label: "Docks", path: "/e2/docks" },
      { label: "Deliveries", path: "/e2/deliveries" },
    ],
  },
  {
    title: "P2 – S&OP / IBP",
    items: [
      { label: "S&OP", path: "/p2/sop" },
      { label: "Demand", path: "/p2/demand" },
      { label: "Inventory", path: "/p2/inventory" },
      { label: "Production", path: "/p2/production" },
      { label: "Procurement", path: "/p2/procurement" },
      { label: "Markdown", path: "/p2/markdown" },
    ],
  },
];

const linkBase = "flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition";
const linkActive = "bg-blue-50 font-medium text-blue-700";
const linkInactive = "text-slate-600 hover:bg-slate-50";

export default function Sidebar() {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Grid width={16} height={16} />
        </div>
        <span className="text-sm font-semibold text-slate-900">SCM Control Tower</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `mb-4 ${linkBase} ${isActive ? linkActive : linkInactive}`}
        >
          <span className="flex items-center gap-2.5">
            <Grid width={16} height={16} />
            Dashboard
          </span>
        </NavLink>

        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
                >
                  {item.label}
                  <ChevronRight width={14} height={14} className="opacity-40" />
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <NavLink to="/alerts" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
          Alerts
        </NavLink>
      </nav>
    </aside>
  );
}
