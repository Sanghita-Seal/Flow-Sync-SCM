import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
  const color = status === "DELIVERED" ? "#10b981" : status === "IN_TRANSIT" ? "#f59e0b" : "#94a3b8";
  const size = 22;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);outline:3px solid rgba(59,130,246,0.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
      </MapContainer>
    </div>
  );
}
