import apiClient from "../../../api/apiClient";

export async function getCycles() {
  const res = await apiClient.get("/api/sop/cycles");
  return res.data.data;
}

export async function getCycleById(cycleId) {
  const res = await apiClient.get(`/api/sop/cycles/${cycleId}`);
  return res.data.data;
}

export async function createCycle(data) {
  const res = await apiClient.post("/api/sop/cycles", data);
  return res.data.data;
}

export async function updateCycleStatus(cycleId, status) {
  const res = await apiClient.patch(`/api/sop/cycles/${cycleId}/status`, { status });
  return res.data.data;
}

export async function getPlan(cycleId) {
  const res = await apiClient.get(`/api/sop/cycles/${cycleId}/plan`);
  return res.data.data;
}

export async function getPlanSummary(cycleId) {
  const res = await apiClient.get(`/api/sop/cycles/${cycleId}/plan/summary`);
  return res.data.data;
}

export async function generatePlan(cycleId) {
  const res = await apiClient.post(`/api/sop/cycles/${cycleId}/plan/generate`);
  return res.data.data;
}

export async function getRecommendations(cycleId) {
  const res = await apiClient.get(`/api/sop/cycles/${cycleId}/recommendations`);
  return res.data.data;
}

export async function getRecommendationSummary(cycleId) {
  const res = await apiClient.get(`/api/sop/cycles/${cycleId}/recommendations/summary`);
  return res.data.data;
}

export async function generateRecommendations(cycleId) {
  const res = await apiClient.post(`/api/sop/cycles/${cycleId}/recommendations/generate`);
  return res.data.data;
}
