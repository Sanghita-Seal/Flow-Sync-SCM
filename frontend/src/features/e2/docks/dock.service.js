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
