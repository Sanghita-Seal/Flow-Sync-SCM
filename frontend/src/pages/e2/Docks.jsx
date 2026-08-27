import { useState, useEffect } from "react";
import { Anchor, CheckCircle, AlertTriangle, Download } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import YardDockPanel from "../../features/e2/yard/components/YardDockPanel";
import { getYards } from "../../features/e2/yard/yard.service";
import DockAssignments from "../../features/e2/docks/components/DockAssignments";
import { getDocks, getDockAssignments, assignDocks } from "../../features/e2/docks/dock.service";
import { getTrucks } from "../../features/e2/trucks/truck.service";

function exportCsv(assignments) {
  const header = "Trailer ID,Shipment,ETA,Status,Priority,Dock,Yard\n";
  const rows = assignments.map((a) =>
    [a.trailer_id, a.trailer_id, a.current_eta ? new Date(a.current_eta).toLocaleString() : "", a.truck_status, a.priority, a.dock_code, a.yard_name].join(",")
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dock-assignments-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Docks() {
  const [yards, setYards] = useState([]);
  const [docks, setDocks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState(null);
  const [selectedTrailer, setSelectedTrailer] = useState(null);

  useEffect(() => {
    Promise.all([getYards().catch(() => []), getDocks().catch(() => []), getTrucks().catch(() => [])])
      .then(([y, d, t]) => { setYards(y); setDocks(d); setTrucks(t); })
      .finally(() => setLoading(false));
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
      const [updatedAssignments, updatedDocks] = await Promise.all([getDockAssignments(), getDocks()]);
      setAssignments(updatedAssignments);
      setDocks(updatedDocks);
    } catch (error) {
      setAssignResult({ error: error.message });
    } finally {
      setAssigning(false);
    }
  }

  const assignedTrailerIds = new Set(assignments.map((a) => a.trailer_id));
  const unassignedTrailers = trucks.filter(
    (t) => (t.status === "ARRIVED" || t.status === "IN_TRANSIT" || t.status === "DELAYED") && !assignedTrailerIds.has(t.trailerId)
  );

  const selectedTruck = selectedTrailer ? trucks.find((t) => t.trailerId === selectedTrailer) : null;
  const availableDocks = docks.filter((d) => d.status === "AVAILABLE");
  const recommendedDock = selectedTruck?.yardName
    ? availableDocks.find((d) => d.yardName === selectedTruck.yardName) || availableDocks[0]
    : availableDocks[0];

  return (
    <PageWrapper
      title="E2 — Dock Assignments"
      description="Yard occupancy, dock availability, and trailer-to-door allocation."
      actions={
        <div className="flex items-center gap-2">
          {assignments.length > 0 && (
            <button
              onClick={() => exportCsv(assignments)}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download size={14} /> Export CSV
            </button>
          )}
          <button
            onClick={handleAssignDocks}
            disabled={assigning}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              assigning ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {assigning ? "Assigning..." : "Auto-Assign Docks"}
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading docks...</div>
      ) : (
        <>
          {/* Yard + Docks grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {yards.map((yard) => (
              <YardDockPanel
                key={yard.id}
                yard={yard}
                docks={docks.filter((d) => d.yardName === yard.name)}
              />
            ))}
          </div>

          {/* Assignment Result */}
          {assignResult && !assignResult.error && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 mb-6">
              <h3 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                <CheckCircle size={14} /> Assignment Complete
              </h3>
              <div className="text-sm text-emerald-700 space-y-1">
                <p>Assigned: {assignResult.assigned?.length || 0} truck(s)</p>
                <p>Waiting: {assignResult.waiting?.length || 0} truck(s)</p>
              </div>
              {assignResult.assigned?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-emerald-800 mb-1">Newly Assigned:</p>
                  <ul className="text-xs text-emerald-700 space-y-1">
                    {assignResult.assigned.map((a, i) => (
                      <li key={i}>{a.trailer_id} → {a.dock_code} ({a.priority})</li>
                    ))}
                  </ul>
                </div>
              )}
              {assignResult.waiting?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-amber-800 mb-1">Waiting for Dock:</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {assignResult.waiting.map((w, i) => (
                      <li key={i}>{w.trailer_id} — {w.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {assignResult?.error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 mb-6">
              <p className="text-sm text-rose-700">Assignment failed: {assignResult.error}</p>
            </div>
          )}

          {/* Unassigned Trailers + Dock Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Unassigned Trailers ({unassignedTrailers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {unassignedTrailers.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">All trailers assigned</p>
                  ) : (
                    unassignedTrailers.map((t) => (
                      <button
                        key={t.trailerId}
                        onClick={() => setSelectedTrailer(t.trailerId)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedTrailer === t.trailerId
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">{t.trailerId}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            t.status === "DELAYED" ? "bg-red-50 text-red-600" :
                            t.status === "ARRIVED" ? "bg-emerald-50 text-emerald-600" :
                            "bg-blue-50 text-blue-600"
                          }`}>{t.status}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{t.yardName || "No yard"} • {t.loadType}</div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Anchor size={14} /> Dock Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedTruck ? (
                  <p className="text-sm text-slate-400 text-center py-8">Select a trailer from the list to see dock recommendation.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500">Trailer:</span> <span className="font-medium text-slate-900 ml-1">{selectedTruck.trailerId}</span></div>
                      <div><span className="text-slate-500">Status:</span> <span className="font-medium text-slate-900 ml-1">{selectedTruck.status}</span></div>
                      <div><span className="text-slate-500">Yard:</span> <span className="font-medium text-slate-900 ml-1">{selectedTruck.yardName || "—"}</span></div>
                      <div><span className="text-slate-500">Priority:</span> <span className="font-medium text-slate-900 ml-1 uppercase">{selectedTruck.priority}</span></div>
                    </div>

                    {recommendedDock ? (
                      <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-emerald-800">Recommended Dock</span>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Best match</span>
                        </div>
                        <div className="text-lg font-bold text-emerald-900">{recommendedDock.dockCode}</div>
                        <div className="text-xs text-emerald-700 mt-1">{recommendedDock.yardName} • Available</div>
                        <div className="text-xs text-emerald-600 mt-2">
                          {selectedTruck.yardName === recommendedDock.yardName
                            ? "Same yard as trailer — fastest routing"
                            : "Best available dock across all yards"}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
                        <AlertTriangle size={16} className="mx-auto text-amber-500 mb-1" />
                        <p className="text-sm text-amber-700">No available docks right now</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Other available docks ({availableDocks.filter((d) => d !== recommendedDock).length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {availableDocks.filter((d) => d !== recommendedDock).slice(0, 6).map((d) => (
                          <div key={d.id} className="rounded-lg border border-slate-200 bg-white p-2 text-center">
                            <div className="text-sm font-semibold text-slate-900">{d.dockCode}</div>
                            <div className="text-xs text-slate-500">{d.yardName}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dock Assignments Table */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Assignments</h2>
            <DockAssignments assignments={assignments} loading={assignmentsLoading} />
          </div>
        </>
      )}
    </PageWrapper>
  );
}
