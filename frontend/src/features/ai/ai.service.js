import apiClient from "../../api/apiClient";

export async function getInsight(type, data) {
  const res = await apiClient.post("/api/ai/insight", { type, data });
  return res.data.data;
}
