import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PublicLayout from "../../layouts/PublicLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { getTrucks } from "../../features/e2/trucks/truck.service";
import { getShipments } from "../../features/e2/shipments/shipment.service";
import useTruckSimulation from "../../hooks/useTruckSimulation";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const WAREHOUSE_POSITION = [22.5726, 88.3639];

const STATUS_TEXT = {
  IN_TRANSIT: "On the way",
  ARRIVED: "Arrived at facility",
  DELAYED: "Delayed",
};

function truckIcon(status) {
  if (status === "DELAYED") {
    return L.divIcon({
      className: "",
      html: `<div style="position:relative;display:inline-block;">
        <div style="width:18px;height:18px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
        <div style="position:absolute;top:-8px;right:-32px;background:#ef4444;color:white;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;white-space:nowrap;letter-spacing:0.3px;">DELAYED</div>
      </div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }
  const color = status === "ARRIVED" ? "#10b981" : status === "IN_TRANSIT" ? "#f59e0b" : "#94a3b8";
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function warehouseIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:32px;height:32px;background:#6366f1;border:2px solid white;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 11, animate: true, duration: 0.8 });
    } else if (positions && positions.length === 1) {
      map.setView(positions[0], 13, { animate: true, duration: 0.8 });
    }
  }, [positions, map]);
  return null;
}

export default function TrackPage() {
  const [input, setInput] = useState("");
  const [truck, setTruck] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const shouldSimulate = truck && (truck.status === "IN_TRANSIT" || truck.status === "DELAYED");
  const truckDirection = truck?.yardName ? "away" : "toward";
  const { position } = useTruckSimulation(truck, shouldSimulate, truckDirection);

  async function handleTrack() {
    if (!input.trim()) return;
    setLoading(true);
    setNotFound(false);
    setTruck(null);
    try {
      const [allTrucks, shipments] = await Promise.all([
        getTrucks().catch(() => []),
        getShipments().catch(() => []),
      ]);
      const refMap = {};
      shipments.forEach((s) => { refMap[s.id] = s.reference; });
      const enriched = allTrucks.map((t) => ({
        ...t,
        shipmentRef: refMap[t.shipmentId] || "",
      }));
      const q = input.trim().toUpperCase();
      const found = enriched.find(
        (t) => t.truckId.toUpperCase() === q || t.trailerId.toUpperCase() === q || t.shipmentId?.toUpperCase() === q
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

  const displayLat = position ? position.latitude : truck ? Number(truck.latitude) : 0;
  const displayLng = position ? position.longitude : truck ? Number(truck.longitude) : 0;

  const hasCoords = displayLat !== 0 && displayLng !== 0 && !isNaN(displayLat) && !isNaN(displayLng);
  const showPolyline = hasCoords && (truck.status === "IN_TRANSIT" || truck.status === "DELAYED");

  return (
    <PublicLayout>
      <div className="text-center mb-5">
        <div className="text-xs uppercase tracking-wide text-faint">Track your shipment</div>
        <div className="text-sm text-muted mt-1">Search by tracking number, trailer ID, or shipment reference</div>
      </div>

      <div className="flex gap-2 mb-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          placeholder="e.g. TRK-001, TRAILER-001, or shipment UUID"
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
          {hasCoords ? (
            <div className="relative h-72">
              <MapContainer
                center={[displayLat, displayLng]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

                {showPolyline ? (
                  <FitBounds positions={[[displayLat, displayLng], WAREHOUSE_POSITION]} />
                ) : (
                  <FitBounds positions={[[displayLat, displayLng]]} />
                )}

                <Marker
                  position={[displayLat, displayLng]}
                  icon={truckIcon(truck.status)}
                >
                  <Popup>
                    <strong>{truck.truckId}</strong>
                    <div>{truck.locationLabel || truck.yardName || ""}</div>
                  </Popup>
                </Marker>

                {showPolyline && (
                  <>
                    <Marker position={WAREHOUSE_POSITION} icon={warehouseIcon()}>
                      <Popup><strong>Warehouse</strong></Popup>
                    </Marker>
                    <Polyline
                      positions={[[displayLat, displayLng], WAREHOUSE_POSITION]}
                      pathOptions={{
                        color: "#3b82f6",
                        weight: 2.5,
                        dashArray: "8 8",
                        opacity: 0.8,
                      }}
                    />
                  </>
                )}
              </MapContainer>

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

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-ink">{truck.truckId}</span>
              <StatusBadge status={truck.status} />
            </div>
            <div className="text-sm text-muted mb-3">{STATUS_TEXT[truck.status] || truck.status}</div>
            <div className="flex justify-between py-1.5 border-t border-border text-sm">
              <span className="text-faint">Shipment</span>
              <span className="text-ink font-medium">{truck.shipmentRef || "—"}</span>
            </div>
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
