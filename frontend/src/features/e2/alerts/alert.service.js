import apiClient from "../../../api/apiClient";

// ============================================================
// API-BASED ALERT FUNCTIONS
// These call the backend alerts endpoints
// ============================================================

// GET /api/e2/alerts
// Fetch delayed truck alerts from the server
export async function fetchDelayedTruckAlerts() {
  const res = await apiClient.get("/api/e2/alerts");
  return res.data.data;
}

// GET /api/e2/alerts/dock/:yard_name
// Check dock availability for a specific yard
export async function checkDockAvailability(yardName) {
  const res = await apiClient.get(`/api/e2/alerts/dock/${encodeURIComponent(yardName)}`);
  return res.data.data;
}

// GET /api/e2/alerts/yard/:yard_name
// Check yard capacity for a specific yard
export async function checkYardCapacity(yardName) {
  const res = await apiClient.get(`/api/e2/alerts/yard/${encodeURIComponent(yardName)}`);
  return res.data.data;
}

// ============================================================
// CLIENT-SIDE ALERT DERIVATION (fallback)
// Derived from truck/dock data when API is unavailable
// ============================================================

export function getAlerts(trucks, docks) {
  const alerts = [];

  trucks.forEach((t) => {
    if (t.status === "DELAYED") {
      alerts.push({
        id: `delay-${t.id}`,
        severity: "high",
        message: `${t.trailerId} is delayed`,
      });
    }
  });

  const availableCount = docks.filter((d) => d.status === "AVAILABLE").length;
  if (availableCount === 0) {
    alerts.push({
      id: "no-docks",
      severity: "high",
      message: "No docks currently available across any yard",
    });
  }

  const arrivedWithoutOpenDock = trucks.filter((t) => {
    if (t.status !== "ARRIVED" || !t.yardName) return false;
    const yardHasOpenDock = docks.some(
      (d) => d.yardName === t.yardName && d.status === "AVAILABLE"
    );
    return !yardHasOpenDock;
  });

  arrivedWithoutOpenDock.forEach((t) => {
    alerts.push({
      id: `reassign-${t.id}`,
      severity: "medium",
      message: `${t.trailerId} needs dock reassignment — no dock free in ${t.yardName}`,
    });
  });

  return alerts;
}
