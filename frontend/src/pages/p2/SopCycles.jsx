import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import { useCycle } from "../../context/CycleContext";
import StatusBadge from "../../components/ui/StatusBadge";

export default function SopCycles() {
  const navigate = useNavigate();
  const { cycles, selectedCycleId, setSelectedCycleId, loading } = useCycle();

  return (
    <PageWrapper title="S&OP Cycles" description="Select a planning cycle to view procurement, risk, and recommendations.">
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading cycles...</div>
      ) : cycles.length === 0 ? (
        <div className="text-sm text-slate-500 py-8 text-center">No S&OP cycles found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cycle Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Start</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">End</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {cycles.map((cycle) => {
                const cycleId = cycle.id;
                const isSelected = cycleId === selectedCycleId;
                return (
                  <tr
                    key={cycleId}
                    className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                    onClick={() => setSelectedCycleId(cycleId)}
                  >
                    <td className="px-4 py-2.5 text-slate-900 font-medium">{cycle.cycle_name || cycle.name}</td>
                    <td className="px-4 py-2.5 text-slate-700">{cycle.start_date ? new Date(cycle.start_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-2.5 text-slate-700">{cycle.end_date ? new Date(cycle.end_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={cycle.status} /></td>
                    <td className="px-4 py-2.5">
                      {isSelected && <span className="text-xs text-blue-600 font-medium">Selected</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedCycleId && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate("/p2/procurement")}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Procurement Plans
          </button>
          <button
            onClick={() => navigate("/p2/risk")}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            View Risk Monitor
          </button>
          <button
            onClick={() => navigate("/p2/recommendations")}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            View Recommendations
          </button>
        </div>
      )}
    </PageWrapper>
  );
}
