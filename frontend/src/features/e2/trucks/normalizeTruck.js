/**
 * Converts the backend's raw truck record (snake_case, string lat/lng,
 * ISO timestamp) into the shape our components use.
 *
 * Raw shape from GET /api/e2/truck:
 * {
 *   id, trailer_id, tracking_number, shipment_id, load_type, priority,
 *   status, current_yard_name, current_location, latitude, longitude,
 *   current_eta
 * }
 */
export function normalizeTruck(raw) {
  return {
    id: raw.id,
    truckId: raw.tracking_number,       // used as the display/search id
    trailerId: raw.trailer_id,
    shipmentId: raw.shipment_id,
    loadType: raw.load_type,
    priority: (raw.priority || "").toLowerCase(),
    status: raw.status,                  // IN_TRANSIT | ARRIVED | DELAYED
    yardName: raw.current_yard_name,     // null while in transit
    locationLabel: raw.current_location,
    latitude: parseFloat(raw.latitude),
    longitude: parseFloat(raw.longitude),
    eta: formatEta(raw.current_eta),
    etaRaw: raw.current_eta,
  };
}

export function normalizeTrucks(rawArray) {
  return rawArray.map(normalizeTruck);
}

function formatEta(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
