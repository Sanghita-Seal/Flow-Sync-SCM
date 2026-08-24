/**
 * Raw shape from GET /api/e2/dock:
 * { id, dock_code, yard_name, status }
 * status: AVAILABLE | OCCUPIED | UNAVAILABLE
 *
 * Note: there is no load-type-compatibility field on docks in the
 * current backend, so dock recommendation can't filter by load type
 * yet — only by availability.
 */
export function normalizeDock(raw) {
  return {
    id: raw.id,
    dockCode: raw.dock_code,
    yardName: raw.yard_name,
    status: raw.status, // AVAILABLE | OCCUPIED | UNAVAILABLE
  };
}

export function normalizeDocks(rawArray) {
  return rawArray.map(normalizeDock);
}
