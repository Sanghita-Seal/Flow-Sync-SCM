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

function truckIcon(status, isSelected) {
  const color = status === "DELIVERED" ? "#10b981" : status === "IN_TRANSIT" ? "#f59e0b" : "#94a3b8";
  const size = isSelected ? 18 : 14;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);${
      isSelected ? "outline:3px solid rgba(59,130,246,0.35);" : ""
    }"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * Pans the map to follow the selected truck's simulated position.
 */
function MapFollower({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.panTo(position, { animate: true, duration: 0.5 });
    }
  }, [position, map]);

  return null;
}

/**
 * Real-world map showing the live/simulated position of each truck,
 * with a dashed line to its destination.
 *
 * @param {Object} props
 * @param {Array} props.trucks - All trucks to display
 * @param {string|null} props.selectedId - Currently selected truck ID
 * @param {Function} props.onSelect - Callback when a truck marker is clicked
 * @param {Array} props.center - Default map center [lat, lng]
 * @param {{ latitude: number, longitude: number }|null} props.simulatedPosition - Simulated position for the selected truck
 */
export default function TruckMap({ trucks, selectedId, onSelect, center = [22.9, 88.0], simulatedPosition }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
      <MapContainer center={center} zoom={8} style={{ height: "440px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        {/* Follow the simulated position */}
        {simulatedPosition && (
          <MapFollower position={[simulatedPosition.latitude, simulatedPosition.longitude]} />
        )}

        {trucks.map((t) => {
          const id = t.truckId || t.id;
          const isSelected = id === selectedId;

          // Use simulated position for the selected truck, API position for others
          const lat = isSelected && simulatedPosition
            ? simulatedPosition.latitude
            : t.latitude;
          const lng = isSelected && simulatedPosition
            ? simulatedPosition.longitude
            : t.longitude;

          // Skip rendering if no valid coordinates
          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

          return (
            <Marker
              key={id}
              position={[lat, lng]}
              icon={truckIcon(t.status, isSelected)}
              eventHandlers={{ click: () => onSelect(id) }}
            >
              <Popup>
                <strong>{id}</strong>
                <div>{t.status}</div>
                {isSelected && simulatedPosition && (
                  <div style={{ fontSize: "10px", color: "#6366f1", marginTop: "2px" }}>
                    GPS Simulation
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}

        {trucks.map((t) =>
          t.destination ? (
            <Polyline
              key={`route-${t.truckId || t.id}`}
              positions={[[t.latitude, t.longitude], [t.destination.latitude, t.destination.longitude]]}
              pathOptions={{ color: "#94a3b8", weight: 2, dashArray: "4 6" }}
            />
          ) : null
        )}
      </MapContainer>

      {/* GPS Simulation indicator */}
      {simulatedPosition && (
        <div className="absolute top-3 right-3 z-[1000] bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          GPS Simulation
        </div>
      )}
    </div>
  );
}
