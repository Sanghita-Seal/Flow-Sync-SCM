/**
 * Public, no-login page. Customer enters their tracking number.
 *
 * TEMPORARY: the backend's single-truck route uses :trailer_id, not
 * tracking_number, and its example value doesn't even match the
 * trailer_id format in the data (see team message). Until that's
 * fixed, we fetch the full list client-side and filter by
 * tracking_number in the browser. Replace with getTruckByTrackingNumber()
 * once backend adds that route — never ship this fallback as-is,
 * since it technically pulls the full fleet to the client first.
 */
import { useState } from "react";
import PublicLayout from "../../layouts/PublicLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { getTrucks } from "../../features/e2/trucks/truck.service";

const STATUS_TEXT = {
  IN_TRANSIT: "On the way",
  ARRIVED: "Arrived at facility",
  DELAYED: "Delayed",
};

export default function TrackPage() {
  const [input, setInput] = useState("");
  const [truck, setTruck] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleTrack() {
    if (!input.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const all = await getTrucks();
      const found = all.find((t) => t.truckId.toUpperCase() === input.trim().toUpperCase());
      if (found) setTruck(found);
      else { setTruck(null); setNotFound(true); }
    } catch {
      setTruck(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <div className="text-center mb-5">
        <div className="text-xs uppercase tracking-wide text-slate-500">Track your shipment</div>
        <div className="text-sm text-slate-600 mt-1">Enter your tracking number to see live status</div>
      </div>

      <div className="flex gap-2 mb-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          placeholder="e.g. TRK-001"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <button
          onClick={handleTrack}
          disabled={loading}
          className="px-5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "..." : "Track"}
        </button>
      </div>

      {truck && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-semibold text-slate-900">{truck.truckId}</span>
            <StatusBadge status={truck.status} />
          </div>
          <div className="text-sm text-slate-700 mb-3">{STATUS_TEXT[truck.status] || truck.status}</div>
          <div className="flex justify-between py-1.5 border-t border-slate-100 text-sm">
            <span className="text-slate-500">Current location</span>
            <span className="text-slate-900 font-medium">{truck.locationLabel || truck.yardName || "—"}</span>
          </div>
          <div className="flex justify-between py-1.5 border-t border-slate-100 text-sm">
            <span className="text-slate-500">ETA</span>
            <span className="text-slate-900 font-medium">{truck.eta}</span>
          </div>
        </div>
      )}

      {notFound && (
        <div className="text-center text-sm text-rose-600 py-4">
          No shipment found with that tracking number.
        </div>
      )}
    </PublicLayout>
  );
}
