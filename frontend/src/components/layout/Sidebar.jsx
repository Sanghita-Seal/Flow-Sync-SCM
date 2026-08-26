import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { LayoutDashboard, Truck, Container, Bell, Calendar, ShoppingCart, Shield, Lightbulb, Warehouse } from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "E2 — Execution",
    items: [
      { to: "/e2/shipments", label: "Shipments", icon: Container },
      { to: "/e2/trucks", label: "Trucks", icon: Truck },
      { to: "/e2/yard", label: "Yard & Docks", icon: Warehouse },
      { to: "/alerts", label: "Alerts", icon: Bell },
    ],
  },
  {
    label: "P2 — Planning",
    items: [
      { to: "/p2/sop", label: "S&OP Cycles", icon: Calendar },
      { to: "/p2/procurement", label: "Procurement", icon: ShoppingCart },
      { to: "/p2/risk", label: "Risk Monitor", icon: Shield },
      { to: "/p2/recommendations", label: "Recommendations", icon: Lightbulb },
    ],
  },
];

export default function Sidebar() {
  return (
    <nav className="w-56 shrink-0 border-r border-slate-200 bg-white h-full overflow-y-auto">
      <div className="flex flex-col gap-1 px-3 py-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
            }`
          }
        >
          <LayoutDashboard size={16} />
          Overview
        </NavLink>

        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mt-4">
            <div className="px-3 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
