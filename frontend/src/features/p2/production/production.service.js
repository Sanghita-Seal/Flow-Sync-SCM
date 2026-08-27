import apiClient from "../../../api/apiClient";

export async function getProduction(filters = {}) {
  const params = new URLSearchParams();
  if (filters.sku) params.append("sku", filters.sku);
  if (filters.week) params.append("week", filters.week);
  const query = params.toString();
  const res = await apiClient.get(`/api/production${query ? `?${query}` : ""}`);
  return res.data.data;
}

export async function getProductionByProductId(productId) {
  const res = await apiClient.get(`/api/production/${productId}`);
  return res.data.data;
}

export async function getProductionSummary() {
  const res = await apiClient.get("/api/production/summary");
  return res.data.data;
}

export async function getProductionCapacity() {
  const res = await apiClient.get("/api/production/capacity");
  return res.data.data;
}
