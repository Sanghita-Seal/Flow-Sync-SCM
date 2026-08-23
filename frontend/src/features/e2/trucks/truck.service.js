import apiClient from "../../../api/apiClient";

export async function getTrucks() {
  const res = await apiClient.get("/api/trucks");
  return res.data;
}

export async function getTruckById(id) {
  const res = await apiClient.get(`/api/trucks/${id}`);
  return res.data;
}
