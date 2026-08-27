import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const WAREHOUSE_POSITION = [22.5726, 88.3639];

function truckIcon(status) {
  const color = status === "DELIVERED" ? "#10b981" : status === "IN_TRANSIT" ? "#f59e0b" : "#94a3b8";
  const size = 16;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function selectedTruckIcon(status) {
  if (status === "DELAYED") {
    return L.divIcon({
      className: "",
      html: `<div style="position:relative;display:inline-block;">
        <div style="width:22px;height:22px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);outline:3px solid rgba(239,68,68,0.4);"></div>
        <div style="position:absolute;top:-8px;right:-30px;background:#ef4444;color:white;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;white-space:nowrap;letter-spacing:0.3px;">DELAYED</div>
      </div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }
  const color = status === "DELIVERED" ? "#10b981" : status === "IN_TRANSIT" ? "#f59e0b" : "#94a3b8";
  const size = 22;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);outline:3px solid rgba(59,130,246,0.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function warehouseIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;background:#6366f1;border:2px solid white;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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

export default function TruckMap({ trucks, selectedId, onSelect, center = [22.9, 88.0], simulatedPosition }) {
  const selectedTruck = selectedId ? trucks.find((t) => (t.truckId || t.id) === selectedId) : null;
  const visibleTrucks = selectedTruck ? [selectedTruck] : trucks;

  const displayPosition = simulatedPosition
    ? [simulatedPosition.latitude, simulatedPosition.longitude]
    : selectedTruck
      ? [Number(selectedTruck.latitude), Number(selectedTruck.longitude)]
      : null;

  const hasValidPosition = displayPosition &&
    !isNaN(displayPosition[0]) && !isNaN(displayPosition[1]) &&
    displayPosition[0] !== 0 && displayPosition[1] !== 0;

  const showPolyline = hasValidPosition && selectedTruck &&
    (selectedTruck.status === "IN_TRANSIT" || selectedTruck.status === "DELAYED");

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={hasValidPosition ? displayPosition : center}
        zoom={hasValidPosition ? 14 : 8}
        style={{ height: "440px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        {hasValidPosition && <ZoomToTruck position={displayPosition} />}

        {visibleTrucks.map((t) => {
          const id = t.truckId || t.id;
          const isSelected = id === selectedId;

          if (isSelected && simulatedPosition) {
            return (
              <Marker
                key={`sim-${id}`}
                position={[simulatedPosition.latitude, simulatedPosition.longitude]}
                icon={selectedTruckIcon(t.status)}
                eventHandlers={{ click: () => onSelect(id) }}
              >
                <Popup>
                  <strong>{id}</strong>
                  <div>{t.status}</div>
                  {t.locationLabel && <div style={{ fontSize: "11px", color: "#64748b" }}>{t.locationLabel}</div>}
                </Popup>
              </Marker>
            );
          }

          const lat = Number(t.latitude);
          const lng = Number(t.longitude);
          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

          return (
            <Marker
              key={id}
              position={[lat, lng]}
              icon={isSelected ? selectedTruckIcon(t.status) : truckIcon(t.status)}
              eventHandlers={{ click: () => onSelect(id) }}
            >
              <Popup>
                <strong>{id}</strong>
                <div>{t.status}</div>
                {t.locationLabel && <div style={{ fontSize: "11px", color: "#64748b" }}>{t.locationLabel}</div>}
              </Popup>
            </Marker>
          );
        })}

        {/* Blue dotted polyline from truck to warehouse */}
        {showPolyline && (
          <>
            <Marker position={WAREHOUSE_POSITION} icon={warehouseIcon()}>
              <Popup><strong>Warehouse</strong></Popup>
            </Marker>
            <Polyline
              positions={[displayPosition, WAREHOUSE_POSITION]}
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
    </div>
  );
}
