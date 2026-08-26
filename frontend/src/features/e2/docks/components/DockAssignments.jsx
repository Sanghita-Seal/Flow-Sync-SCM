import { motion } from "motion/react";
import { Badge } from "../../../../components/ui/Badge";

const PRIORITY_VARIANT = {
  HIGH: "rose",
  MEDIUM: "amber",
  LOW: "emerald",
};

export default function DockAssignments({ assignments, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-4 text-center">No active dock assignments.</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Trailer</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Dock</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden sm:table-cell">Yard</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden md:table-cell">Status</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden md:table-cell">ETA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {assignments.map((a, i) => (
            <motion.tr
              key={a.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="hover:bg-slate-50"
            >
              <td className="px-4 py-2.5 text-slate-900 font-medium">{a.trailer_id}</td>
              <td className="px-4 py-2.5 text-slate-700">{a.dock_code}</td>
              <td className="px-4 py-2.5 text-slate-700 hidden sm:table-cell">{a.yard_name}</td>
              <td className="px-4 py-2.5"><Badge variant={PRIORITY_VARIANT[a.priority] || "amber"}>{a.priority}</Badge></td>
              <td className="px-4 py-2.5 hidden md:table-cell"><Badge variant={a.truck_status === "DELAYED" ? "rose" : "blue"}>{a.truck_status}</Badge></td>
              <td className="px-4 py-2.5 text-slate-700 hidden md:table-cell">{a.current_eta ? new Date(a.current_eta).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
