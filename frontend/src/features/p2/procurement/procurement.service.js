import apiClient from "../../../api/apiClient";

export async function getProcurement(filters = {}) {
  const params = new URLSearchParams();
  if (filters.cycleId) params.append("cycleId", filters.cycleId);
  if (filters.sku) params.append("sku", filters.sku);
  if (filters.week) params.append("week", filters.week);
  if (filters.riskLevel) params.append("riskLevel", filters.riskLevel);
  if (filters.status) params.append("status", filters.status);
  const query = params.toString();
  const res = await apiClient.get(`/api/procurement${query ? `?${query}` : ""}`);
  return res.data.data;
}

export async function getProcurementByProductId(productId) {
  const res = await apiClient.get(`/api/procurement/${productId}`);
  return res.data.data;
}

export async function getProcurementSummary() {
  const res = await apiClient.get("/api/procurement/summary");
  return res.data.data;
}

export async function getProcurementRisk() {
  const res = await apiClient.get("/api/procurement/risk");
  return res.data.data;
}

export async function getProcurementPlanShipments(procurementPlanId) {
  const res = await apiClient.get(`/api/procurement/plans/${procurementPlanId}/shipments`);
  return res.data.data;
}
