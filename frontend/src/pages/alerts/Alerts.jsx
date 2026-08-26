import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import { getTrucks } from "../../features/e2/trucks/truck.service";
import { getDocks } from "../../features/e2/docks/dock.service";
import { getAlerts } from "../../features/e2/alerts/alert.service";

const SEVERITY_STYLES = {
  high: "bg-rose-50 border-rose-200 text-rose-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrucks(), getDocks()])
      .then(([trucks, docks]) => setAlerts(getAlerts(trucks, docks)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title="Alerts" description="Delayed trucks, dock unavailability, and reassignment notices.">
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-sm text-slate-500 py-8 text-center">No active alerts.</div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className={`rounded-lg border px-4 py-3 text-sm ${SEVERITY_STYLES[a.severity]}`}>
              {a.message}
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}