import apiClient from "../../../api/apiClient";

export async function getDemand(filters = {}) {
  const params = new URLSearchParams();
  if (filters.cycleId) params.append("cycleId", filters.cycleId);
  if (filters.sku) params.append("sku", filters.sku);
  if (filters.week) params.append("week", filters.week);
  const query = params.toString();
  const res = await apiClient.get(`/api/demand${query ? `?${query}` : ""}`);
  return res.data.data;
}

export async function getDemandByProductId(productId) {
  const res = await apiClient.get(`/api/demand/${productId}`);
  return res.data.data;
}

export async function getDemandSummary() {
  const res = await apiClient.get("/api/demand/summary");
  return res.data.data;
}

export async function getDemandTrend() {
  const res = await apiClient.get("/api/demand/trend");
  return res.data.data;
}
