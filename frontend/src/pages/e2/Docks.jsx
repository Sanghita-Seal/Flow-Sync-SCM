import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import DockStatusBoard from "../../features/e2/docks/components/DockStatusBoard";
import DockAssignments from "../../features/e2/docks/components/DockAssignments";
import {
  getDocks,
  getDockAssignments,
  assignDocks,
} from "../../features/e2/docks/dock.service";

export default function Docks() {
  const [docks, setDocks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState(null);

  useEffect(() => {
    getDocks().then(setDocks).finally(() => setLoading(false));
    getDockAssignments()
      .then(setAssignments)
      .finally(() => setAssignmentsLoading(false));
  }, []);

  async function handleAssignDocks() {
    setAssigning(true);
    setAssignResult(null);
    try {
      const result = await assignDocks();
      setAssignResult(result);
      // Refresh assignments after auto-assign
      const updatedAssignments = await getDockAssignments();
      setAssignments(updatedAssignments);
      // Refresh docks to reflect status changes
      const updatedDocks = await getDocks();
      setDocks(updatedDocks);
    } catch (error) {
      setAssignResult({ error: error.message });
    } finally {
      setAssigning(false);
    }
  }

  return (
    <PageWrapper
      title="E2 — Docks"
      description="Dock availability across all yards."
      actions={
        <button
          onClick={handleAssignDocks}
          disabled={assigning}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            assigning
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {assigning ? "Assigning..." : "Auto-Assign Docks"}
        </button>
      }
    >
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">
          Loading docks...
        </div>
      ) : (
        <DockStatusBoard docks={docks} />
      )}

      {/* Assignment Result */}
      {assignResult && !assignResult.error && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-semibold text-emerald-800 mb-2">
            Assignment Complete
          </h3>
          <div className="text-sm text-emerald-700 space-y-1">
            <p>
              Assigned: {assignResult.assigned?.length || 0} truck(s)
            </p>
            <p>
              Waiting: {assignResult.waiting?.length || 0} truck(s)
            </p>
          </div>
          {assignResult.assigned?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-emerald-800 mb-1">
                Newly Assigned:
              </p>
              <ul className="text-xs text-emerald-700 space-y-1">
                {assignResult.assigned.map((a, i) => (
                  <li key={i}>
                    {a.trailer_id} → {a.dock_code} ({a.priority})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {assignResult.waiting?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-amber-800 mb-1">
                Waiting for Dock:
              </p>
              <ul className="text-xs text-amber-700 space-y-1">
                {assignResult.waiting.map((w, i) => (
                  <li key={i}>
                    {w.trailer_id} — {w.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Assignment Error */}
      {assignResult?.error && (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-700">
            Assignment failed: {assignResult.error}
          </p>
        </div>
      )}

      {/* Dock Assignments Table */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Current Assignments
        </h2>
        <DockAssignments assignments={assignments} loading={assignmentsLoading} />
      </div>
    </PageWrapper>
  );
}
