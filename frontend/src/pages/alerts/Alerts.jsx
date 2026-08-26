import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import {
  fetchDelayedTruckAlerts,
  checkDockAvailability,
  checkYardCapacity,
} from "../../features/e2/alerts/alert.service";
import { getTrucks } from "../../features/e2/trucks/truck.service";
import { getDocks } from "../../features/e2/docks/dock.service";
import { getAlerts } from "../../features/e2/alerts/alert.service";
import StatusBadge from "../../components/ui/StatusBadge";

const ALERT_TYPE_STYLES = {
  TRUCK_DELAYED: "bg-rose-50 border-rose-200 text-rose-700",
  DOCK_UNAVAILABLE: "bg-amber-50 border-amber-200 text-amber-700",
  YARD_FULL: "bg-rose-50 border-rose-200 text-rose-700",
};

const PRIORITY_STYLES = {
  HIGH: "bg-rose-100 text-rose-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        // Try fetching delayed truck alerts from the backend API
        const delayedAlerts = await fetchDelayedTruckAlerts();
        setAlerts(delayedAlerts);
      } catch (apiError) {
        // Fallback to client-side computation if API fails
        console.warn("API alerts unavailable, using client-side computation:", apiError.message);
        try {
          const [trucks, docks] = await Promise.all([getTrucks(), getDocks()]);
          setAlerts(getAlerts(trucks, docks));
        } catch (fallbackError) {
          setError(fallbackError.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  return (
    <PageWrapper
      title="Alerts"
      description="Delayed trucks, dock unavailability, and reassignment notices."
    >
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">
          Loading alerts...
        </div>
      ) : error ? (
        <div className="text-sm text-rose-500 py-8 text-center">
          Error loading alerts: {error}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-sm text-slate-500 py-8 text-center">
          No active alerts.
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, index) => {
            // Handle both API-based and client-side alert formats
            const alertType = alert.alert_type || "TRUCK_DELAYED";
            const severity = alertType === "TRUCK_DELAYED"
              ? "high"
              : alertType === "DOCK_UNAVAILABLE"
              ? "medium"
              : "high";

            return (
              <div
                key={alert.trailer_id || alert.id || index}
                className={`rounded-lg border px-4 py-3 text-sm ${
                  ALERT_TYPE_STYLES[alertType] || ALERT_TYPE_STYLES.TRUCK_DELAYED
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {alert.priority && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          PRIORITY_STYLES[alert.priority] || PRIORITY_STYLES.MEDIUM
                        }`}
                      >
                        {alert.priority}
                      </span>
                    )}
                    <span className="font-medium">{alert.message}</span>
                  </div>
                  <StatusBadge status={alertType.replace("_", " ")} />
                </div>
                {(alert.current_location || alert.current_eta) && (
                  <div className="mt-2 text-xs text-slate-600 flex gap-4">
                    {alert.current_location && (
                      <span>Location: {alert.current_location}</span>
                    )}
                    {alert.current_eta && <span>ETA: {alert.current_eta}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
