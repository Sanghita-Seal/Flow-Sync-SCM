import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Truck, Bell, Calendar, ShoppingCart, Shield, Lightbulb, Warehouse, Container, BarChart3, X } from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";

const NAV_SECTIONS = [
  {
    label: "E2 — Execution",
    items: [
      { to: "/e2/overview", label: "Overview", icon: BarChart3 },
      { to: "/e2/shipments", label: "Shipments", icon: Container },
      { to: "/e2/trucks", label: "Trucks", icon: Truck },
      { to: "/e2/yard", label: "Yard & Docks", icon: Warehouse },
      { to: "/alerts", label: "Alerts", icon: Bell },
    ],
  },
  {
    label: "P2 — Planning",
    items: [
      { to: "/p2/overview", label: "Overview", icon: BarChart3 },
      { to: "/p2/sop", label: "S&OP Cycles", icon: Calendar },
      { to: "/p2/procurement", label: "Procurement", icon: ShoppingCart },
      { to: "/p2/risk", label: "Risk Monitor", icon: Shield },
      { to: "/p2/recommendations", label: "Recommendations", icon: Lightbulb },
    ],
  },
];

function SidebarContent() {
  const { close } = useSidebar();

  return (
    <div className="flex flex-col h-full">
      {/* Mobile close button */}
      <div className="flex items-center justify-between px-4 py-4 lg:hidden">
        <span className="text-sm font-semibold text-slate-900">Navigation</span>
        <button
          onClick={close}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
        <NavLink
          to="/dashboard"
          onClick={close}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
            }`
          }
        >
          <LayoutDashboard size={16} />
          Dashboard
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
                  onClick={close}
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
    </div>
  );
}

export default function Sidebar() {
  const { open, close } = useSidebar();

  return (
    <>
      {/* Desktop sidebar - always visible */}
      <aside className="hidden lg:block w-56 shrink-0 border-r border-slate-200 bg-white h-full overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar - overlay + slide-in */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={close}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 lg:hidden overflow-y-auto"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
