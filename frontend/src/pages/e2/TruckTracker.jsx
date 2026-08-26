import { useState, useEffect, useCallback } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import TruckSearch from "../../features/e2/trucks/components/TruckSearch";
import TruckMap from "../../features/e2/trucks/components/TruckMap";
import TruckDetails from "../../features/e2/trucks/components/TruckDetails";
import StatusBadge from "../../components/ui/StatusBadge";
import { getTrucks } from "../../features/e2/trucks/truck.service";
import useTruckSimulation from "../../hooks/useTruckSimulation";

export default function TruckTracker() {
  const [trucks, setTrucks] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrucks()
      .then(setTrucks)
      .finally(() => setLoading(false));
  }, []);

  const filtered = trucks.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      t.truckId.toLowerCase().includes(q) ||
      t.trailerId.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    const exactMatch = trucks.find(
      (t) => t.truckId?.toLowerCase() === q || t.trailerId?.toLowerCase() === q
    );

    if (exactMatch) {
      setSelectedId(exactMatch.truckId);
    }
  }, [query, trucks]);

  const selectedTruck = trucks.find((t) => t.truckId === selectedId) || null;

  // Auto-simulate: run only for IN_TRANSIT trucks
  const shouldSimulate = selectedTruck && selectedTruck.status === "IN_TRANSIT";
  const { position } = useTruckSimulation(selectedTruck, shouldSimulate);

  return (
    <PageWrapper title="E2 — Truck Tracker" description="Warehouse operations view — search, track, and monitor every truck in the network.">
      <div className="mb-4">
        <TruckSearch onSearch={setQuery} />
      </div>

      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading trucks...</div>
      ) : (
        <>
          <div className="flex gap-4 flex-wrap items-start mb-6">
            <div className="flex-1 min-w-[320px]">
              <TruckMap
                trucks={filtered}
                selectedId={selectedId}
                onSelect={setSelectedId}
                simulatedPosition={shouldSimulate && position ? position : null}
              />
            </div>
            <TruckDetails truck={selectedTruck} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left">
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Truck</th>
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Priority</th>
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Load Type</th>
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Location</th>
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">ETA</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.truckId}
                    onClick={() => setSelectedId(t.truckId)}
                    className={`cursor-pointer border-t border-slate-100 ${
                      t.truckId === selectedId ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-900 font-medium">{t.truckId}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-slate-700 capitalize">{t.priority}</td>
                    <td className="px-4 py-3 text-slate-700">{t.loadType}</td>
                    <td className="px-4 py-3 text-slate-700">{t.locationLabel}</td>
                    <td className="px-4 py-3 text-slate-700">{t.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
