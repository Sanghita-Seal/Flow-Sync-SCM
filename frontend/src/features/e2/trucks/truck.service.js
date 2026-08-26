import apiClient from "../../../api/apiClient";
import { normalizeTruck, normalizeTrucks } from "./normalizeTruck";

export async function getTrucks() {
  const res = await apiClient.get("/api/e2/truck");
  // Response is wrapped: { success, data: [...], meta: { count } }
  return normalizeTrucks(res.data.data);
}

// NOTE: backend route is GET /api/e2/truck/:trailer_id right now, which
// doesn't work for a customer tracking-number lookup (see team message).
// This function is a placeholder for when that's fixed/added.
export async function getTruckByTrailerId(trailerId) {
  const res = await apiClient.get(`/api/e2/truck/${trailerId}`);
  return normalizeTruck(res.data.data);
}

export async function getTrucksByStatus(status) {
  const res = await apiClient.get(`/api/e2/truck/status/${status}`);
  return normalizeTrucks(res.data.data);
}
