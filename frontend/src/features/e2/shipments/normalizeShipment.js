/**
 * Raw shape from GET /api/e2/shipment:
 * { id, shipment_reference, origin, destination, status,
 *   procurement_plan_id, planned_arrival, planned_quantity_m, received_quantity_m }
 */
export function normalizeShipment(raw) {
  return {
    id: raw.id,
    reference: raw.shipment_reference,
    origin: raw.origin,
    destination: raw.destination,
    status: raw.status,
    procurementPlanId: raw.procurement_plan_id,
    plannedArrival: raw.planned_arrival,
    plannedQuantityM: raw.planned_quantity_m ? Number(raw.planned_quantity_m) : null,
    receivedQuantityM: raw.received_quantity_m ? Number(raw.received_quantity_m) : null,
  };
}

export function normalizeShipments(rawArray) {
  return rawArray.map(normalizeShipment);
}
