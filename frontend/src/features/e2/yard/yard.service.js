import apiClient from "../../../api/apiClient";
import { normalizeYard, normalizeYards } from "./normalizeYard";

export async function getYards() {
  const res = await apiClient.get("/api/e2/yard");
  return normalizeYards(res.data.data);
}

export async function getYardByName(name) {
  const res = await apiClient.get(`/api/e2/yard/${name}`);
  return normalizeYard(res.data.data);
}
