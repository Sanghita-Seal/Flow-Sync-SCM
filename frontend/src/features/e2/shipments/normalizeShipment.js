/**
 * Raw shape from GET /api/e2/shipment:
 * { id, shipment_reference, origin, destination, status }
 *
 * Note: no truck_id, eta, or progress on the shipment record itself.
 * The truck record links to a shipment via truck.shipment_id — if we
 * need ETA/progress per shipment, join client-side against the trucks
 * list by matching shipment_id, or ask backend to include it.
 */
export function normalizeShipment(raw) {
  return {
    id: raw.id,
    reference: raw.shipment_reference,
    origin: raw.origin,
    destination: raw.destination,
    status: raw.status, // IN_TRANSIT | ARRIVED | DELAYED
  };
}

export function normalizeShipments(rawArray) {
  return rawArray.map(normalizeShipment);
}
