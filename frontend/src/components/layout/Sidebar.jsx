import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Overview" },
  { to: "/e2/trucks", label: "Trucks" },
  { to: "/e2/yard", label: "Yard" },
  { to: "/e2/docks", label: "Docks" },
  { to: "/e2/deliveries", label: "Deliveries" },
  { to: "/alerts", label: "Alerts" },
  // P2 items added once that feature is built:
  // { to: "/p2/sop", label: "S&OP" },
];

export default function Sidebar() {
  return (
    <nav className="w-52 shrink-0 border-r border-slate-200 bg-white py-4">
      <div className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => (
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
        ))}
      </div>
    </nav>
  );
}
