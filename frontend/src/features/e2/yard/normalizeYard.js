/**
 * Raw shape from GET /api/e2/yard:
 * { id, name, capacity, number_of_trucks, status }
 */
export function normalizeYard(raw) {
  return {
    id: raw.id,
    name: raw.name,
    capacity: raw.capacity,
    trucksInYard: raw.number_of_trucks,
    status: raw.status, // ACTIVE | FULL (only ACTIVE seen so far)
  };
}

export function normalizeYards(rawArray) {
  return rawArray.map(normalizeYard);
}
