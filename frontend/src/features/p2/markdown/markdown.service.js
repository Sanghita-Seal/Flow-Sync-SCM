import apiClient from "../../../api/apiClient";

export async function getMarkdown(filters = {}) {
  const params = new URLSearchParams();
  if (filters.sku) params.append("sku", filters.sku);
  if (filters.week) params.append("week", filters.week);
  const query = params.toString();
  const res = await apiClient.get(`/api/markdown${query ? `?${query}` : ""}`);
  return res.data.data;
}

export async function getMarkdownByProductId(productId) {
  const res = await apiClient.get(`/api/markdown/${productId}`);
  return res.data.data;
}

export async function getMarkdownSummary() {
  const res = await apiClient.get("/api/markdown/summary");
  return res.data.data;
}
