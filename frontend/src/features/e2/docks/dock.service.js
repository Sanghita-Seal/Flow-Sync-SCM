import apiClient from "../../../api/apiClient";
import { normalizeDock, normalizeDocks } from "./normalizeDock";

export async function getDocks() {
  const res = await apiClient.get("/api/e2/dock");
  return normalizeDocks(res.data.data);
}

export async function getDockByCode(dockCode) {
  const res = await apiClient.get(`/api/e2/dock/${dockCode}`);
  return normalizeDock(res.data.data);
}

export async function getDocksByStatus(status) {
  const res = await apiClient.get(`/api/e2/dock/status/${status}`);
  return normalizeDocks(res.data.data);
}

// GET /api/e2/dock/assignments
// Fetch all current dock assignments
export async function getDockAssignments() {
  const res = await apiClient.get("/api/e2/dock/assignments");
  return res.data.data;
}

// POST /api/e2/dock/assign
// Trigger the dock assignment algorithm
export async function assignDocks() {
  const res = await apiClient.post("/api/e2/dock/assign");
  return res.data.data;
}
