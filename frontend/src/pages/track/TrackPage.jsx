import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PublicLayout from "../../layouts/PublicLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { getTrucks } from "../../features/e2/trucks/truck.service";
import useTruckSimulation from "../../hooks/useTruckSimulation";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_TEXT = {
  IN_TRANSIT: "On the way",
  ARRIVED: "Arrived at facility",
  DELAYED: "Delayed",
};

function truckIcon(status) {
  const color = status === "ARRIVED" ? "#10b981" : status === "IN_TRANSIT" ? "#f59e0b" : "#94a3b8";
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function ZoomToTruck({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 14, { animate: true, duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

export default function TrackPage() {
  const [input, setInput] = useState("");
  const [truck, setTruck] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-simulate for IN_TRANSIT trucks
  const shouldSimulate = truck && truck.status === "IN_TRANSIT";
  const { position } = useTruckSimulation(truck, shouldSimulate);

  async function handleTrack() {
    if (!input.trim()) return;
    setLoading(true);
    setNotFound(false);
    setTruck(null);
    try {
      const all = await getTrucks();
      const q = input.trim().toUpperCase();
      const found = all.find(
        (t) => t.truckId.toUpperCase() === q || t.shipmentId?.toUpperCase() === q
      );
      if (found) setTruck(found);
      else { setTruck(null); setNotFound(true); }
    } catch {
      setTruck(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  // Use simulated position if available, otherwise use API coords
  const displayLat = position ? position.latitude : truck ? Number(truck.latitude) : 0;
  const displayLng = position ? position.longitude : truck ? Number(truck.longitude) : 0;

  const hasCoords = displayLat !== 0 && displayLng !== 0 && !isNaN(displayLat) && !isNaN(displayLng);

  return (
    <PublicLayout>
      <div className="text-center mb-5">
        <div className="text-xs uppercase tracking-wide text-faint">Track your shipment</div>
        <div className="text-sm text-muted mt-1">Enter tracking number or shipment reference to see live status</div>
      </div>

      <div className="flex gap-2 mb-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          placeholder="e.g. TRK-001 or shipment UUID"
          className="flex-1 rounded-node border border-border bg-page px-3 py-2.5 text-sm text-ink placeholder:text-faint outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
        />
        <button
          onClick={handleTrack}
          disabled={loading}
          className="px-5 rounded-node bg-primary text-page font-medium text-sm hover:bg-primary-strong disabled:opacity-60 transition-colors"
        >
          {loading ? "..." : "Track"}
        </button>
      </div>

      {truck && (
        <div className="rounded-card border border-border bg-page shadow-card overflow-hidden">
          {/* Map */}
          {hasCoords ? (
            <div className="relative h-72">
              <MapContainer
                center={[displayLat, displayLng]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                <ZoomToTruck position={[displayLat, displayLng]} />
                <Marker
                  position={[displayLat, displayLng]}
                  icon={truckIcon(truck.status)}
                >
                  <Popup>
                    <strong>{truck.truckId}</strong>
                    <div>{truck.locationLabel || truck.yardName || ""}</div>
                  </Popup>
                </Marker>
              </MapContainer>

              {/* Simulation badge */}
              {shouldSimulate && position && (
                <div className="absolute top-3 right-3 z-[1000] bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Live tracking
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 bg-surface flex items-center justify-center text-sm text-faint">
              No location data available
            </div>
          )}

          {/* Details */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-ink">{truck.truckId}</span>
              <StatusBadge status={truck.status} />
            </div>
            <div className="text-sm text-muted mb-3">{STATUS_TEXT[truck.status] || truck.status}</div>
            <div className="flex justify-between py-1.5 border-t border-border text-sm">
              <span className="text-faint">Current location</span>
              <span className="text-ink font-medium">{truck.locationLabel || truck.yardName || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-t border-border text-sm">
              <span className="text-faint">ETA</span>
              <span className="text-ink font-medium">{truck.eta}</span>
            </div>
          </div>
        </div>
      )}

      {notFound && (
        <div className="text-center text-sm text-danger py-4">
          No shipment found with that tracking number.
        </div>
      )}
    </PublicLayout>
  );
}
