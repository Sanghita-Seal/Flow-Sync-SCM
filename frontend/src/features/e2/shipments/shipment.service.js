import apiClient from "../../../api/apiClient";
import { normalizeShipment, normalizeShipments } from "./normalizeShipment";

export async function getShipments() {
  const res = await apiClient.get("/api/e2/shipment");
  return normalizeShipments(res.data.data);
}

export async function getShipmentByReference(reference) {
  const res = await apiClient.get(`/api/e2/shipment/${reference}`);
  return normalizeShipment(res.data.data);
}
