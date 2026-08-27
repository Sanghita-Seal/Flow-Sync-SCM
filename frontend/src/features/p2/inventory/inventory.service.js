import apiClient from "../../../api/apiClient";

export async function getInventory(filters = {}) {
  const params = new URLSearchParams();
  if (filters.sku) params.append("sku", filters.sku);
  const query = params.toString();
  const res = await apiClient.get(`/api/inventory${query ? `?${query}` : ""}`);
  return res.data.data;
}

export async function getInventoryByProductId(productId) {
  const res = await apiClient.get(`/api/inventory/${productId}`);
  return res.data.data;
}

export async function getInventorySummary() {
  const res = await apiClient.get("/api/inventory/summary");
  return res.data.data;
}

export async function getInventoryRisk() {
  const res = await apiClient.get("/api/inventory/risk");
  return res.data.data;
}
