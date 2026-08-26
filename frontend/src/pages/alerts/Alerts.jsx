import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  fetchDelayedTruckAlerts,
} from "../../features/e2/alerts/alert.service";
import { getTrucks } from "../../features/e2/trucks/truck.service";
import { getDocks } from "../../features/e2/docks/dock.service";
import { getAlerts } from "../../features/e2/alerts/alert.service";

const ALERT_STYLES = {
  TRUCK_DELAYED: "rose",
  DOCK_UNAVAILABLE: "amber",
  YARD_FULL: "rose",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const delayedAlerts = await fetchDelayedTruckAlerts();
        setAlerts(delayedAlerts);
      } catch {
        try {
          const [trucks, docks] = await Promise.all([getTrucks(), getDocks()]);
          setAlerts(getAlerts(trucks, docks));
        } catch {
          setAlerts([]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  return (
    <PageWrapper title="Alerts" description="Delayed trucks, dock unavailability, and reassignment notices.">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-slate-500">No active alerts.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert, index) => {
              const alertType = alert.alert_type || "TRUCK_DELAYED";
              return (
                <motion.div
                  key={alert.trailer_id || alert.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {alert.priority && (
                            <Badge variant={alert.priority === "HIGH" ? "rose" : alert.priority === "MEDIUM" ? "amber" : "emerald"}>
                              {alert.priority}
                            </Badge>
                          )}
                          <span className="text-sm font-medium text-slate-900">{alert.message}</span>
                        </div>
                        <Badge variant={ALERT_STYLES[alertType] || "blue"}>
                          {alertType.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      {(alert.current_location || alert.current_eta) && (
                        <div className="mt-2 text-xs text-slate-500 flex gap-4">
                          {alert.current_location && <span>Location: {alert.current_location}</span>}
                          {alert.current_eta && <span>ETA: {new Date(alert.current_eta).toLocaleDateString()}</span>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </PageWrapper>
  );
}
