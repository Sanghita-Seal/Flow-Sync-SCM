import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, XCircle, CheckCircle, Info, Eye, Anchor, Truck } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { fetchDelayedTruckAlerts, getAlerts } from "../../features/e2/alerts/alert.service";
import { getTrucks } from "../../features/e2/trucks/truck.service";
import { getDocks } from "../../features/e2/docks/dock.service";

const SEVERITY_CONFIG = {
  high: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 border-red-200", badge: "rose", label: "Critical" },
  medium: { icon: Info, color: "text-amber-500", bg: "bg-amber-50 border-amber-200", badge: "amber", label: "Warning" },
  low: { icon: Info, color: "text-blue-500", bg: "bg-blue-50 border-blue-200", badge: "blue", label: "Info" },
};

const ALERT_TYPE_LABELS = {
  TRUCK_DELAYED: "Truck Delayed",
  DOCK_UNAVAILABLE: "Dock Unavailable",
  YARD_FULL: "Yard Full",
};

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());
  const [acknowledged, setAcknowledged] = useState(new Set());

  useEffect(() => {
    async function loadAlerts() {
      try {
        const apiAlerts = await fetchDelayedTruckAlerts();
        setAlerts(apiAlerts);
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

  function handleDismiss(id) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  function handleAcknowledge(id) {
    setAcknowledged((prev) => new Set([...prev, id]));
  }

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.trailer_id || a.id));
  const activeCount = visibleAlerts.filter((a) => !acknowledged.has(a.trailer_id || a.id)).length;

  return (
    <PageWrapper
      title="Alert Center"
      description="Operational alerts for delayed trucks, dock unavailability, and reassignment needs."
      actions={
        <div className="flex items-center gap-3">
          <Badge variant={activeCount > 0 ? "rose" : "emerald"}>
            {activeCount} active alert{activeCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : visibleAlerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle size={32} className="mx-auto text-emerald-500 mb-3" />
            <p className="text-sm font-medium text-slate-700">No active alerts</p>
            <p className="text-xs text-slate-400 mt-1">All systems operating normally</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {visibleAlerts.map((alert, index) => {
              const id = alert.trailer_id || alert.id || index;
              const severity = alert.severity || "high";
              const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.high;
              const SevIcon = config.icon;
              const isAcked = acknowledged.has(id);
              const alertType = alert.alert_type || "TRUCK_DELAYED";

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isAcked ? 0.6 : 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`${config.bg} ${isAcked ? "opacity-60" : ""}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <SevIcon size={18} className={`${config.color} mt-0.5 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={config.badge}>{config.label}</Badge>
                              <Badge variant="blue">{ALERT_TYPE_LABELS[alertType] || alertType.replace(/_/g, " ")}</Badge>
                              {isAcked && <Badge variant="emerald">Acknowledged</Badge>}
                            </div>
                            <p className="text-sm font-medium text-slate-900 mt-1.5">{alert.message}</p>
                            {(alert.trailer_id || alert.current_location || alert.current_eta) && (
                              <div className="mt-2 text-xs text-slate-600 flex gap-4 flex-wrap">
                                {alert.trailer_id && <span>Trailer: <span className="font-medium">{alert.trailer_id}</span></span>}
                                {alert.current_location && <span>Location: {alert.current_location}</span>}
                                {alert.current_eta && <span>ETA: {new Date(alert.current_eta).toLocaleString()}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isAcked && (
                            <button
                              onClick={() => handleAcknowledge(id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Acknowledge"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDismiss(id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Dismiss"
                          >
                            <XCircle size={14} />
                          </button>
                          {alert.trailer_id && (
                            <button
                              onClick={() => navigate("/e2/docks")}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View dock assignments"
                            >
                              <Anchor size={14} />
                            </button>
                          )}
                        </div>
                      </div>
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
