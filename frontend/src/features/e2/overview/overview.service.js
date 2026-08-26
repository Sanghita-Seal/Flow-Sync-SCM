import apiClient from "../../../api/apiClient";

/**
 * Raw shape from GET /api/e2/overview — all values are STRINGS, need
 * parseInt(). data.<field> e.g. "total_trucks": "15"
 */
export async function getOverview() {
  const res = await apiClient.get("/api/e2/overview");
  const d = res.data.data;
  return {
    totalTrucks: parseInt(d.total_trucks, 10),
    trucksInTransit: parseInt(d.trucks_in_transit, 10),
    trucksArrived: parseInt(d.trucks_arrived, 10),
    delayedTrucks: parseInt(d.delayed_trucks, 10),
    trucksInYard: parseInt(d.trucks_in_yard, 10),
    totalDocks: parseInt(d.total_docks, 10),
    availableDocks: parseInt(d.available_docks, 10),
    occupiedDocks: parseInt(d.occupied_docks, 10),
    unavailableDocks: parseInt(d.unavailable_docks, 10),
    totalYards: parseInt(d.total_yards, 10),
    activeYards: parseInt(d.active_yards, 10),
    fullYards: parseInt(d.full_yards, 10),
    totalCapacity: parseInt(d.total_capacity, 10),
    totalShipments: parseInt(d.total_shipments, 10),
    shipmentsInTransit: parseInt(d.shipments_in_transit, 10),
    shipmentsArrived: parseInt(d.shipments_arrived, 10),
    delayedShipments: parseInt(d.delayed_shipments, 10),
  };
}
