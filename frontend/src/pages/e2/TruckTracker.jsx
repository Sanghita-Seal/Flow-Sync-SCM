import { useState, useEffect } from "react";
// import { useSocket } from "../../context/SocketContext"; // uncomment once backend socket is live

import PageWrapper from "../../components/layout/PageWrapper";
import TruckSearch from "../../features/e2/trucks/components/TruckSearch";
import TruckMap from "../../features/e2/trucks/components/TruckMap";
import TruckDetails from "../../features/e2/trucks/components/TruckDetails";
import TruckProgress from "../../features/e2/trucks/components/TruckProgress";
import StatusBadge from "../../components/ui/StatusBadge";
import { useTruckSocket } from "../../features/e2/trucks/truck.socket";
// import { getTrucks } from "../../features/e2/trucks/truck.service";

export default function TruckTracker() {
  const socket = null; // const socket = useSocket();
  const [trucks, setTrucks] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    // Replace with the real API call once backend is ready:
    // getTrucks().then(setTrucks);
    setTrucks([
      { truckId: "TRK-101", status: "IN_TRANSIT", latitude: 22.57, longitude: 88.36, destination: { latitude: 23.52, longitude: 87.31 }, eta: "10:15", progress: 40, priority: "high", loadType: "FABRIC" },
      { truckId: "TRK-102", status: "IN_TRANSIT", latitude: 22.9, longitude: 87.9, destination: { latitude: 23.25, longitude: 87.9 }, eta: "10:30", progress: 65, priority: "medium", loadType: "GARMENTS" },
      { truckId: "TRK-103", status: "DELIVERED", latitude: 23.0, longitude: 88.2, eta: "Delivered", progress: 100, priority: "normal", loadType: "PALLET" },
    ]);
  }, []);

  // Local simulation — moves IN_TRANSIT trucks toward their destination.
  // Remove once useTruckSocket receives real live position updates.
  useEffect(() => {
    const MOVEMENT_STEP = 0.002;
    const tick = setInterval(() => {
      setTrucks((prev) =>
        prev.map((t) => {
          if (t.status !== "IN_TRANSIT" || !t.destination) return t;
          const dLat = t.destination.latitude - t.latitude;
          const dLng = t.destination.longitude - t.longitude;
          const distance = Math.sqrt(dLat * dLat + dLng * dLng);
          if (distance < MOVEMENT_STEP) {
            return { ...t, latitude: t.destination.latitude, longitude: t.destination.longitude, status: "DELIVERED", progress: 100 };
          }
          return {
            ...t,
            latitude: t.latitude + (dLat / distance) * MOVEMENT_STEP,
            longitude: t.longitude + (dLng / distance) * MOVEMENT_STEP,
            progress: Math.min(99, t.progress + 1),
          };
        })
      );
    }, 800);
    return () => clearInterval(tick);
  }, []);

  useTruckSocket(socket, setTrucks);

  const filtered = trucks.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (t.truckId || t.id || "").toLowerCase().includes(q);
  });

  const selectedTruck = trucks.find((t) => (t.truckId || t.id) === selectedId) || null;

  return (
    <PageWrapper title="E2 — Truck Tracker" description="Search, track, and monitor every truck currently in the network.">
      <div className="mb-4">
        <TruckSearch onSearch={setQuery} />
      </div>

      <div className="flex gap-4 flex-wrap items-start mb-6">
        <div className="flex-1 min-w-[320px]">
          <TruckMap trucks={filtered} selectedId={selectedId} onSelect={setSelectedId} />
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
              <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Progress</th>
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
                <td className="px-4 py-3 w-48"><TruckProgress progress={t.progress} eta={t.eta} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}