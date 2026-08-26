import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";

function getArrivalWindow(etaRaw) {
  if (!etaRaw) return null;
  const d = new Date(etaRaw);
  const hour = d.getHours();
  const start = `${String(hour).padStart(2, "0")}:00`;
  const end = `${String(hour + 1).padStart(2, "0")}:00`;
  return `${start} – ${end}`;
}

function groupByWindow(trucks) {
  const groups = {};
  trucks.forEach((t) => {
    if (!t.etaRaw || t.status === "ARRIVED") return;
    const window = getArrivalWindow(t.etaRaw);
    if (!window) return;
    if (!groups[window]) groups[window] = [];
    groups[window].push(t);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

const STATUS_STYLE = {
  IN_TRANSIT: "bg-blue-50 text-blue-600",
  DELAYED: "bg-red-50 text-red-600",
  ARRIVED: "bg-emerald-50 text-emerald-600",
};

export default function ArrivalWindows({ trucks, onSelectTruck }) {
  const [expanded, setExpanded] = useState({});
  const groups = groupByWindow(trucks);

  function toggleWindow(window) {
    setExpanded((prev) => ({ ...prev, [window]: !prev[window] }));
  }

  if (groups.length === 0) {
    return (
      <div className="text-sm text-slate-400 text-center py-6">
        <Clock size={16} className="mx-auto mb-2 text-slate-300" />
        No upcoming arrival windows
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map(([window, windowTrucks]) => {
        const isExpanded = expanded[window] !== false;
        return (
          <div key={window} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <button
              onClick={() => toggleWindow(window)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                <span className="text-sm font-semibold text-slate-900">{window}</span>
              </div>
              <span className="text-xs text-slate-500">{windowTrucks.length} trailer{windowTrucks.length !== 1 ? "s" : ""}</span>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {windowTrucks.map((t) => (
                      <button
                        key={t.truckId}
                        onClick={() => onSelectTruck?.(t.truckId)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-900">{t.trailerId}</span>
                          <span className="text-xs text-slate-400">{t.truckId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${STATUS_STYLE[t.status] || STATUS_STYLE.IN_TRANSIT}`}>
                            {t.status === "IN_TRANSIT" ? "On time" : t.status === "DELAYED" ? "Delayed" : "Arrived"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
