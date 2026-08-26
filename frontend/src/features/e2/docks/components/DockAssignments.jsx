import StatusBadge from "../../../../components/ui/StatusBadge";

const PRIORITY_STYLES = {
  HIGH: "bg-rose-100 text-rose-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

export default function DockAssignments({ assignments, loading }) {
  if (loading) {
    return (
      <div className="text-sm text-slate-500 py-4 text-center">
        Loading assignments...
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-4 text-center">
        No active dock assignments.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Trailer ID
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dock Code
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Yard
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Priority
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Truck Status
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              ETA
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="hover:bg-slate-50">
              <td className="px-4 py-2.5 text-slate-700 font-medium">
                {assignment.trailer_id}
              </td>
              <td className="px-4 py-2.5 text-slate-700">
                {assignment.dock_code}
              </td>
              <td className="px-4 py-2.5 text-slate-700">
                {assignment.yard_name}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    PRIORITY_STYLES[assignment.priority] || PRIORITY_STYLES.MEDIUM
                  }`}
                >
                  {assignment.priority}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge status={assignment.truck_status} />
              </td>
              <td className="px-4 py-2.5 text-slate-700">
                {assignment.current_eta || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
