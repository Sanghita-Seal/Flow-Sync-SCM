import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Overview" },

  { type: "section", label: "E2 — Execution" },
  { to: "/e2/shipments", label: "Shipments" },
  { to: "/e2/trucks", label: "Trucks" },
  { to: "/e2/yard", label: "Yard & Docks" },
  { to: "/alerts", label: "Alerts" },

  { type: "section", label: "P2 — Planning" },
  { to: "/p2/sop", label: "S&OP Cycles" },
  { to: "/p2/procurement", label: "Procurement" },
  { to: "/p2/risk", label: "Risk Monitor" },
  { to: "/p2/recommendations", label: "Recommendations" },
];

export default function Sidebar() {
  return (
    <nav className="w-52 shrink-0 border-r border-slate-200 bg-white py-4">
      <div className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item, index) => {
          if (item.type === "section") {
            return (
              <div key={`section-${index}`} className="mt-3 mb-1 px-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {item.label}
                </span>
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
