import apiClient from "../../../api/apiClient";

export async function getP2Overview() {
  const res = await apiClient.get("/api/p2/overview");
  return res.data.data;
}
